import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { AlertTriangle, Sparkles } from 'lucide-react-native';
import ScanReview, { buildMedicineCreate } from '@/components/ScanReview';
import { MED_COLORS } from '@/constants/medColors';
import { DRUGS } from '@/constants/drugs';
import type {
  MedicineCreate,
  ParsedMedicine,
  ParsedPrescription,
  ScanResult,
  UploadFile,
} from '@/lib/api';
import { useT } from '@/lib/i18n/useT';
import {
  useBulkCreateMedicines,
  useMedicines,
  usePatchPatient,
  useScanPrescription,
} from '@/lib/queries';
import { today } from '@/lib/schedule';
import { useTheme } from '@/lib/themeStore';

interface SelectedFile {
  uri: string;
  mimeType: string;
  name: string;
}

function getMeds(parsed: ParsedPrescription | null): ParsedMedicine[] {
  if (!parsed) return [];
  return parsed.medications ?? parsed.medicines ?? [];
}

function findDrugTip(drugName: string): string {
  const target = drugName.toLowerCase();
  return DRUGS.find((d) => d.name.toLowerCase() === target)?.tip ?? '';
}

async function buildUploadFile(file: SelectedFile): Promise<UploadFile> {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(file.uri)).blob();
    return new File([blob], file.name, { type: file.mimeType });
  }
  return { uri: file.uri, name: file.name, type: file.mimeType };
}

function fileNameFromUri(uri: string, fallback: string): string {
  const last = uri.split('/').pop();
  if (last && last.length > 0) return last;
  return fallback;
}

export default function ScanScreen() {
  const router = useRouter();
  const { tokens } = useTheme();
  const t = useT();

  const TIPS: readonly string[] = [
    t('scan_tip_1'),
    t('scan_tip_2'),
    t('scan_tip_3'),
    t('scan_tip_4'),
  ];

  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [extracted, setExtracted] = useState<ParsedPrescription | null>(null);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [error, setError] = useState<string>('');

  const scanMutation = useScanPrescription();
  const bulkCreate = useBulkCreateMedicines();
  const patchPatient = usePatchPatient();
  const medsQ = useMedicines();

  const isScanning = scanMutation.isPending;
  const isSaving = bulkCreate.isPending || patchPatient.isPending;
  const inReview = extracted !== null;

  const existingMedsCount = medsQ.data?.length ?? 0;

  // PWA share-target handoff: when a patient shares a prescription PDF/image
  // from WhatsApp into the installed PWA, a service worker (future v1.1) will
  // intercept POST /scan and stash the file as a base64 data URI in
  // sessionStorage under `rt-shared-file`. We pick it up here on mount.
  // TODO(T23 v1.1): register service worker that catches POST /scan and writes to sessionStorage
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof window === 'undefined') return;
    const sharedJson = window.sessionStorage.getItem('rt-shared-file');
    if (!sharedJson) return;
    try {
      const shared = JSON.parse(sharedJson) as {
        uri: string;
        mimeType: string;
        name: string;
      };
      setSelectedFile(shared);
      window.sessionStorage.removeItem('rt-shared-file');
    } catch {
      /* no-op: malformed handoff payload */
    }
  }, []);

  const resetAll = useCallback(() => {
    setSelectedFile(null);
    setExtracted(null);
    setSelected(new Set());
    setError('');
    scanMutation.reset();
    bulkCreate.reset();
    patchPatient.reset();
  }, [scanMutation, bulkCreate, patchPatient]);

  const onTakePhoto = useCallback(async () => {
    setError('');
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        t('scan_camera_permission'),
        t('scan_camera_permission_hint')
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;
    setSelectedFile({
      uri: asset.uri,
      mimeType: asset.mimeType ?? 'image/jpeg',
      name: asset.fileName ?? fileNameFromUri(asset.uri, 'prescription.jpg'),
    });
    setExtracted(null);
    scanMutation.reset();
  }, [scanMutation]);

  const onChoosePhoto = useCallback(async () => {
    setError('');
    if (Platform.OS !== 'web') {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          t('scan_photo_library_permission'),
          t('scan_photo_library_permission_hint')
        );
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;
    setSelectedFile({
      uri: asset.uri,
      mimeType: asset.mimeType ?? 'image/jpeg',
      name: asset.fileName ?? fileNameFromUri(asset.uri, 'prescription.jpg'),
    });
    setExtracted(null);
    scanMutation.reset();
  }, [scanMutation]);

  const onChoosePdf = useCallback(async () => {
    setError('');
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;
    setSelectedFile({
      uri: asset.uri,
      mimeType: asset.mimeType ?? 'application/pdf',
      name: asset.name ?? fileNameFromUri(asset.uri, 'prescription.pdf'),
    });
    setExtracted(null);
    scanMutation.reset();
  }, [scanMutation]);

  const onScan = useCallback(async () => {
    if (!selectedFile) return;
    setError('');
    try {
      const upload = await buildUploadFile(selectedFile);
      const result: ScanResult = await scanMutation.mutateAsync(upload);
      const meds = getMeds(result.parsed);
      if (meds.length === 0) {
        setError(t('scan_no_meds_found'));
        return;
      }
      setExtracted(result.parsed);
      setSelected(new Set(meds.map((_m, i) => i)));
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : t('scan_could_not_read_try_clearer');
      setError(msg);
    }
  }, [selectedFile, scanMutation, t]);

  const meds = useMemo(() => getMeds(extracted), [extracted]);

  const onToggle = useCallback((i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  const onSelectAll = useCallback(() => {
    setSelected(new Set(meds.map((_m, i) => i)));
  }, [meds]);

  const onUnselectAll = useCallback(() => {
    setSelected(new Set());
  }, []);

  const onBackFromReview = useCallback(() => {
    setExtracted(null);
    setSelected(new Set());
    setError('');
    scanMutation.reset();
  }, [scanMutation]);

  const onSave = useCallback(async () => {
    if (!extracted) return;
    const startDate = today();
    const indices = Array.from(selected).sort((a, b) => a - b);
    const rows: MedicineCreate[] = indices.map((idx, i) => {
      const m = meds[idx];
      const color = MED_COLORS[(existingMedsCount + i) % MED_COLORS.length];
      const base = buildMedicineCreate(m, startDate, color);
      const tip = findDrugTip(m.drugName);
      return tip ? { ...base, tip } : base;
    });
    if (rows.length === 0) return;
    try {
      await bulkCreate.mutateAsync(rows);
      if (extracted.diagnosis) {
        try {
          await patchPatient.mutateAsync({ diagnosis: extracted.diagnosis });
        } catch {
          // diagnosis is best-effort — don't block navigation if patch fails
        }
      }
      resetAll();
      router.replace('/(tabs)' as Href);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Failed to save medicines.';
      Alert.alert(t('save_failed'), msg);
    }
  }, [
    extracted,
    selected,
    meds,
    existingMedsCount,
    bulkCreate,
    patchPatient,
    resetAll,
    router,
  ]);

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={{ flex: 1, backgroundColor: tokens.bg }}
    >
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Gradient header */}
        <LinearGradient
          colors={tokens.header.colors}
          start={tokens.header.start}
          end={tokens.header.end}
          style={{ paddingTop: 22, paddingHorizontal: 18, paddingBottom: 16 }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 9,
              marginBottom: 4,
            }}
          >
            <Sparkles size={22} color="white" />
            <Text style={{ fontSize: 22, fontWeight: '900', color: 'white' }}>
              {t('scan_prescription')}
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: 'white', opacity: 0.85 }}>
            {t('scan_header_sub')}
          </Text>
        </LinearGradient>

        <View style={{ padding: 13 }}>
          {inReview && extracted ? (
            <ScanReview
              extracted={extracted}
              selected={selected}
              onToggle={onToggle}
              onSelectAll={onSelectAll}
              onUnselectAll={onUnselectAll}
              onBack={onBackFromReview}
              onSave={onSave}
              isSaving={isSaving}
            />
          ) : (
            <>
              {/* Upload zone */}
              <View
                style={{
                  backgroundColor: tokens.card,
                  borderWidth: 3,
                  borderStyle: 'dashed',
                  borderColor: '#CBD5E1',
                  borderRadius: 18,
                  paddingVertical: 30,
                  paddingHorizontal: 18,
                  alignItems: 'center',
                  marginBottom: 13,
                }}
              >
                {selectedFile ? (
                  selectedFile.mimeType.startsWith('image/') ? (
                    <Image
                      source={{ uri: selectedFile.uri }}
                      resizeMode="contain"
                      accessibilityLabel="Selected prescription image"
                      style={{
                        width: '100%',
                        height: 230,
                        borderRadius: 11,
                      }}
                    />
                  ) : (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 48, marginBottom: 11 }}>📄</Text>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: '800',
                          color: tokens.text,
                          textAlign: 'center',
                        }}
                      >
                        {selectedFile.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: tokens.text2,
                          marginTop: 4,
                        }}
                      >
                        {t('pdf_selected')}
                      </Text>
                    </View>
                  )
                ) : (
                  <>
                    <Text style={{ fontSize: 48, marginBottom: 11 }}>📄</Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '800',
                        color: tokens.text,
                      }}
                    >
                      {t('upload_prescription_photo')}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: tokens.text2,
                        marginTop: 6,
                        textAlign: 'center',
                      }}
                    >
                      {t('scan_upload_hint')}
                    </Text>
                  </>
                )}
              </View>

              {/* Picker buttons */}
              <View
                style={{
                  flexDirection: 'row',
                  gap: 7,
                  marginBottom: 13,
                }}
              >
                <PickerButton
                  label={t('take_photo')}
                  emoji="📷"
                  onPress={onTakePhoto}
                  disabled={isScanning}
                  tokens={tokens}
                />
                <PickerButton
                  label={t('gallery')}
                  emoji="🖼️"
                  onPress={onChoosePhoto}
                  disabled={isScanning}
                  tokens={tokens}
                />
                <PickerButton
                  label={t('choose_pdf')}
                  emoji="📄"
                  onPress={onChoosePdf}
                  disabled={isScanning}
                  tokens={tokens}
                />
              </View>

              {/* Action buttons (only when a file is selected & not currently scanning) */}
              {selectedFile && !isScanning ? (
                <View
                  style={{ flexDirection: 'row', gap: 9, marginBottom: 13 }}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Change image"
                    onPress={resetAll}
                    style={{
                      flex: 1,
                      backgroundColor: tokens.card2,
                      borderWidth: 2,
                      borderColor: tokens.border,
                      borderRadius: 13,
                      padding: 13,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: tokens.text2,
                        fontWeight: '700',
                        fontSize: 14,
                      }}
                    >
                      {t('change_image')}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Read prescription"
                    onPress={onScan}
                    style={{ flex: 2 }}
                  >
                    <LinearGradient
                      colors={['#0D9488', '#0284C7']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        borderRadius: 13,
                        padding: 13,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 7,
                      }}
                    >
                      <Sparkles size={17} color="white" />
                      <Text
                        style={{
                          color: 'white',
                          fontWeight: '800',
                          fontSize: 15,
                        }}
                      >
                        📋 {t('read_prescription')}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              ) : null}

              {/* Scanning loader */}
              {isScanning ? (
                <View
                  style={{
                    backgroundColor: tokens.card,
                    borderRadius: 14,
                    padding: 22,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: tokens.border,
                    marginBottom: 13,
                  }}
                >
                  <ActivityIndicator
                    size="large"
                    color="#0D9488"
                    style={{ marginBottom: 11 }}
                  />
                  <Text
                    style={{
                      fontWeight: '800',
                      fontSize: 17,
                      color: tokens.text,
                      textAlign: 'center',
                    }}
                  >
                    {t('scan_ai_reading')}
                  </Text>
                  <Text
                    style={{
                      color: tokens.text2,
                      fontSize: 13,
                      marginTop: 5,
                      textAlign: 'center',
                    }}
                  >
                    {t('scan_extracting')}
                  </Text>
                </View>
              ) : null}

              {/* Error card */}
              {error && !isScanning ? (
                <View
                  style={{
                    backgroundColor: '#FEF2F2',
                    borderWidth: 2,
                    borderColor: '#FCA5A5',
                    borderRadius: 14,
                    padding: 18,
                    alignItems: 'center',
                    marginBottom: 13,
                  }}
                >
                  <AlertTriangle
                    size={32}
                    color="#EF4444"
                    style={{ marginBottom: 8 }}
                  />
                  <Text
                    style={{ fontWeight: '800', color: '#991B1B', fontSize: 16 }}
                  >
                    {t('could_not_read_prescription')}
                  </Text>
                  <Text
                    style={{
                      color: '#DC2626',
                      fontSize: 13,
                      marginTop: 6,
                      textAlign: 'center',
                    }}
                  >
                    {error}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setError('');
                      scanMutation.reset();
                    }}
                    style={{
                      marginTop: 11,
                      backgroundColor: '#EF4444',
                      borderRadius: 11,
                      paddingVertical: 9,
                      paddingHorizontal: 16,
                    }}
                  >
                    <Text
                      style={{
                        color: 'white',
                        fontWeight: '700',
                        fontSize: 14,
                      }}
                    >
                      {t('try_again')}
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              {/* Tips card */}
              <View
                style={{
                  backgroundColor: tokens.card2,
                  borderRadius: 13,
                  padding: 13,
                  borderWidth: 1,
                  borderColor: tokens.border,
                }}
              >
                <Text
                  style={{
                    fontWeight: '800',
                    color: tokens.text,
                    fontSize: 14,
                    marginBottom: 7,
                  }}
                >
                  {t('scan_tips_heading')}
                </Text>
                {TIPS.map((tip) => (
                  <View
                    key={tip}
                    style={{
                      flexDirection: 'row',
                      gap: 6,
                      marginBottom: 5,
                    }}
                  >
                    <Text style={{ color: '#0D9488', fontWeight: '700' }}>
                      •
                    </Text>
                    <Text
                      style={{
                        color: tokens.text2,
                        fontSize: 13,
                        fontWeight: '600',
                        flex: 1,
                      }}
                    >
                      {tip}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface PickerButtonProps {
  label: string;
  emoji: string;
  onPress: () => void;
  disabled: boolean;
  tokens: ReturnType<typeof useTheme>['tokens'];
}

function PickerButton({
  label,
  emoji,
  onPress,
  disabled,
  tokens,
}: PickerButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={{
        flex: 1,
        backgroundColor: tokens.card,
        borderWidth: 2,
        borderColor: tokens.border,
        borderRadius: 12,
        paddingVertical: 11,
        paddingHorizontal: 6,
        alignItems: 'center',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text style={{ fontSize: 18, marginBottom: 3 }}>{emoji}</Text>
      <Text
        style={{ fontSize: 12, fontWeight: '700', color: tokens.text }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}
