import { useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, Modal, Platform, Pressable, ScrollView, Text, TextInput, View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Svg, {
  Circle, Line, Polyline, Rect, Text as SvgText, G,
} from 'react-native-svg';
import {
  AlertTriangle, ArrowLeft, Camera, Check, ChevronRight, Loader2, Plus,
  Search, Sparkles, TrendingUp, X,
} from 'lucide-react-native';
import {
  LAB_TESTS, LAB_CATS, QUAL_OPTS, flagBg, flagClr, flagLbl, flagVal,
  type LabTest,
} from '@/constants/labs';
import {
  useCreateLabReport, useLabReports, useScanLabReport,
} from '@/lib/queries';
import type { LabReport, LabResultEntry, UploadFile } from '@/lib/api';
import { today } from '@/lib/schedule';
import { useTheme } from '@/lib/themeStore';
import { useT } from '@/lib/i18n/useT';
import LabRow from '@/components/LabRow';

type Screen =
  | { kind: 'dash' }
  | { kind: 'graph'; test: LabTest }
  | { kind: 'addManual' }
  | { kind: 'scan' };

interface SelectedFile { uri: string; mimeType: string; name: string }

async function buildUploadFile(file: SelectedFile): Promise<UploadFile> {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(file.uri)).blob();
    return new File([blob], file.name, { type: file.mimeType });
  }
  return { uri: file.uri, name: file.name, type: file.mimeType };
}

export default function LabsView() {
  const { tokens } = useTheme();
  const t = useT();
  const [screen, setScreen] = useState<Screen>({ kind: 'dash' });

  const reportsQ = useLabReports();
  const reports = reportsQ.data ?? [];

  const latest = useMemo(() => {
    const out: Record<string, { v: string; date: string }> = {};
    [...reports]
      .sort((a, b) => (a.reportDate < b.reportDate ? -1 : 1))
      .forEach((e) => e.results.forEach((r) => {
        out[r.testId] = { v: r.value, date: e.reportDate };
      }));
    return out;
  }, [reports]);

  const histories = useMemo(() => {
    const out: Record<string, Array<{ date: string; value: number }>> = {};
    for (const r of reports) {
      for (const entry of r.results ?? []) {
        const num = parseFloat(entry.value);
        if (Number.isNaN(num)) continue;
        if (!out[entry.testId]) out[entry.testId] = [];
        out[entry.testId].push({ date: r.reportDate, value: num });
      }
    }
    for (const k of Object.keys(out)) {
      out[k].sort((a, b) => a.date.localeCompare(b.date));
    }
    return out;
  }, [reports]);

  const abnormal = useMemo(
    () => LAB_TESTS.filter((t) => {
      const lv = latest[t.id];
      if (!lv) return false;
      const f = flagVal(t, lv.v);
      return f === 'low' || f === 'high';
    }),
    [latest],
  );

  if (screen.kind === 'graph') {
    return <LabGraph test={screen.test} reports={reports} onBack={() => setScreen({ kind: 'dash' })} />;
  }
  if (screen.kind === 'addManual') {
    return <AddLabManual onClose={() => setScreen({ kind: 'dash' })} />;
  }
  if (screen.kind === 'scan') {
    return <ScanLab onClose={() => setScreen({ kind: 'dash' })} />;
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={{ padding: 13 }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setScreen({ kind: 'scan' })}
            style={{
              flex: 1, backgroundColor: '#0D9488', borderRadius: 10,
              padding: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
            <Camera size={15} color="white" />
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>{t('scan_lab_report')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setScreen({ kind: 'addManual' })}
            style={{
              flex: 1, backgroundColor: tokens.card, borderRadius: 10,
              padding: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
              borderWidth: 2, borderColor: tokens.border,
            }}>
            <Plus size={15} color="#0D9488" />
            <Text style={{ color: '#0D9488', fontWeight: '800', fontSize: 13 }}>{t('add_manually')}</Text>
          </Pressable>
        </View>

        {reportsQ.isLoading ? (
          <View style={{ alignItems: 'center', padding: 30 }}>
            <ActivityIndicator color="#0D9488" />
          </View>
        ) : null}

        {reports.length === 0 && !reportsQ.isLoading ? (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Text style={{ fontSize: 46, marginBottom: 10 }}>🧪</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: tokens.text2, marginBottom: 6 }}>
              {t('no_labs_yet')}
            </Text>
            <Text style={{ fontSize: 13, color: tokens.text2, textAlign: 'center', marginBottom: 14 }}>
              {t('scan_or_add_manual')}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setScreen({ kind: 'addManual' })}
              style={{ backgroundColor: '#0D9488', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 11 }}>
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>{t('add_results')}</Text>
            </Pressable>
          </View>
        ) : null}

        {abnormal.length > 0 ? (
          <View style={{
            backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12, marginBottom: 12,
            borderWidth: 2, borderColor: '#FCA5A5',
          }}>
            <Text style={{ fontWeight: '800', color: '#991B1B', fontSize: 12, marginBottom: 7 }}>
              ⚠️ {t('abnormal_labs')}
            </Text>
            {abnormal.map((t) => {
              const lv = latest[t.id];
              const f = flagVal(t, lv.v);
              return (
                <Pressable
                  accessibilityRole="button"
                  key={t.id}
                  onPress={() => setScreen({ kind: 'graph', test: t })}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 12, color: '#991B1B' }}>{t.name}</Text>
                    <Text style={{ fontSize: 11, color: '#DC2626' }}>{lv.v} {t.unit}</Text>
                  </View>
                  <Text style={{
                    backgroundColor: flagClr(f), color: 'white', fontWeight: '800',
                    fontSize: 11, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2,
                  }}>{flagLbl(f)}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {LAB_CATS.filter((c) => c !== 'All').map((cat) => {
          const ct = LAB_TESTS.filter((t) => t.cat === cat && latest[t.id]);
          if (!ct.length) return null;
          return (
            <View key={cat} style={{ marginBottom: 12 }}>
              <Text style={{
                fontWeight: '800', fontSize: 11, color: tokens.text2, marginBottom: 6,
                textTransform: 'uppercase', letterSpacing: 0.4,
              }}>{cat}</Text>
              {ct.map((t) => (
                <LabRow
                  key={t.id}
                  test={t}
                  latestValue={latest[t.id]?.v ?? null}
                  history={histories[t.id] ?? []}
                />
              ))}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function LabGraph({
  test, reports, onBack,
}: { test: LabTest; reports: LabReport[]; onBack: () => void }) {
  const { tokens } = useTheme();
  const t = useT();
  const readings = useMemo(
    () => [...reports]
      .sort((a, b) => (a.reportDate < b.reportDate ? -1 : 1))
      .flatMap((e) => {
        const r = e.results.find((rr) => rr.testId === test.id);
        return r ? [{ value: r.value, date: e.reportDate }] : [];
      }),
    [reports, test.id],
  );

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={onBack}>
      <View style={{ flex: 1, backgroundColor: tokens.bg }}>
        <View style={{
          backgroundColor: '#0D9488', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 14,
        }}>
          <Pressable accessibilityRole="button" onPress={onBack}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 6,
              alignSelf: 'flex-start', marginBottom: 8,
            }}>
            <ArrowLeft size={16} color="white" />
          </Pressable>
          <Text style={{ fontSize: 20, fontWeight: '900', color: 'white' }}>{test.name}</Text>
          <Text style={{ fontSize: 12, color: 'white', opacity: 0.85 }}>
            {readings.length} reading{readings.length !== 1 ? 's' : ''} · {test.unit || 'qualitative'}
          </Text>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 13, paddingBottom: 30 }}>
          <View style={{
            backgroundColor: '#FEF3C7', borderRadius: 10, padding: 9, marginBottom: 12,
            borderWidth: 1, borderColor: '#F59E0B', flexDirection: 'row', gap: 6,
          }}>
            <AlertTriangle size={12} color="#D97706" />
            <Text style={{ fontSize: 11, color: '#92400E', fontWeight: '600', flex: 1, lineHeight: 16 }}>
              {test.warn}
            </Text>
          </View>

          {!test.qualitative && readings.length > 0 ? (
            <View style={{
              backgroundColor: tokens.card, borderRadius: 12, padding: 11, marginBottom: 12,
              borderWidth: 2, borderColor: tokens.border,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                <TrendingUp size={13} color="#0D9488" />
                <Text style={{ fontWeight: '800', fontSize: 12, color: tokens.text }}>{t('trend')}</Text>
              </View>
              <LineGraph readings={readings} test={test} />
              {test.nMin !== null ? (
                <Text style={{ fontSize: 10, color: tokens.text2, textAlign: 'center', marginTop: 4 }}>
                  Normal: {test.nMin} – {test.nMax !== null && test.nMax < 999 ? test.nMax : '+'} {test.unit}
                </Text>
              ) : null}
            </View>
          ) : null}

          <Text style={{
            fontWeight: '800', color: tokens.text2, fontSize: 10, marginBottom: 8,
            textTransform: 'uppercase', letterSpacing: 0.4,
          }}>{t('all_readings')}</Text>
          {[...readings].sort((a, b) => (a.date < b.date ? 1 : -1)).map((r, i) => {
            const f = flagVal(test, r.value);
            return (
              <View key={i} style={{
                backgroundColor: tokens.card, borderRadius: 10, padding: 10, marginBottom: 6,
                borderWidth: 2,
                borderColor: f === 'normal' || f === 'qual' ? tokens.border : flagClr(f),
                flexDirection: 'row', alignItems: 'center', gap: 10,
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '800', fontSize: 14, color: flagClr(f) }}>
                    {r.value} <Text style={{ fontSize: 12, color: tokens.text2, fontWeight: '600' }}>{test.unit}</Text>
                  </Text>
                  <Text style={{ fontSize: 11, color: tokens.text2, fontWeight: '600' }}>{r.date}</Text>
                </View>
                <View style={{
                  backgroundColor: flagBg(f), borderWidth: 1, borderColor: flagClr(f),
                  borderRadius: 7, paddingHorizontal: 9, paddingVertical: 3,
                }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: flagClr(f) }}>{flagLbl(f)}</Text>
                </View>
              </View>
            );
          })}
          {readings.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 30 }}>
              <Text style={{ fontSize: 36 }}>📊</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: tokens.text2, marginTop: 8 }}>
                {t('no_readings_yet')}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

function LineGraph({
  readings, test,
}: { readings: { value: string; date: string }[]; test: LabTest }) {
  const nums = readings.filter((r) => !isNaN(parseFloat(r.value)));
  if (nums.length === 0) return null;
  const W = 320, H = 110, P = { t: 14, r: 12, b: 32, l: 36 };
  const gW = W - P.l - P.r;
  const gH = H - P.t - P.b;
  const vals = nums.map((r) => parseFloat(r.value));
  const allV = [...vals];
  if (test.nMin !== null) allV.push(test.nMin);
  if (test.nMax !== null && test.nMax < 999) allV.push(test.nMax);
  const lo = Math.min(...allV) * 0.88;
  const hi = Math.max(...allV) * 1.12;
  const range = hi - lo || 1;
  const sy = (v: number): number => P.t + gH - ((v - lo) / range) * gH;
  const sx = (i: number): number =>
    P.l + (nums.length === 1 ? gW / 2 : (i / (nums.length - 1)) * gW);

  const showBand = test.nMin !== null && test.nMax !== null && test.nMax < 999;
  const yMaxBand = showBand ? sy(Math.min(test.nMax!, hi)) : 0;
  const yMinBand = showBand ? sy(Math.max(test.nMin!, lo)) : 0;
  return (
    <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height={140}>
      {showBand ? (
        <Rect x={P.l} y={yMaxBand} width={gW}
          height={Math.max(0, yMinBand - yMaxBand)}
          fill="#D1FAE5" fillOpacity={0.5} />
      ) : null}
      {test.nMin !== null ? (
        <Line x1={P.l} y1={sy(Math.max(test.nMin, lo))} x2={P.l + gW} y2={sy(Math.max(test.nMin, lo))}
          stroke="#16A34A" strokeWidth={1} strokeDasharray="4,3" opacity={0.7} />
      ) : null}
      {test.nMax !== null && test.nMax < 999 ? (
        <Line x1={P.l} y1={sy(Math.min(test.nMax, hi))} x2={P.l + gW} y2={sy(Math.min(test.nMax, hi))}
          stroke="#16A34A" strokeWidth={1} strokeDasharray="4,3" opacity={0.7} />
      ) : null}
      {[0, 1, 2, 3].map((i) => {
        const v = lo + (i / 3) * range;
        return (
          <G key={i}>
            <Line x1={P.l} y1={sy(v)} x2={P.l + gW} y2={sy(v)} stroke="#E2E8F0" strokeWidth={0.5} />
            <SvgText x={P.l - 3} y={sy(v) + 4} fontSize={8} fill="#94A3B8" textAnchor="end">
              {v.toFixed(v < 10 ? 1 : 0)}
            </SvgText>
          </G>
        );
      })}
      {nums.length > 1 ? (
        <Polyline
          points={nums.map((r, i) => `${sx(i)},${sy(parseFloat(r.value))}`).join(' ')}
          fill="none" stroke="#0D9488" strokeWidth={2.5}
          strokeLinecap="round" strokeLinejoin="round"
        />
      ) : null}
      {nums.map((r, i) => {
        const f = flagVal(test, r.value);
        const cx = sx(i), cy = sy(parseFloat(r.value));
        return (
          <G key={`pt-${i}`}>
            <Circle cx={cx} cy={cy} r={5} fill={flagClr(f)} stroke="white" strokeWidth={1.5} />
            <SvgText x={cx} y={cy - 9} fontSize={9} fill={flagClr(f)} textAnchor="middle" fontWeight="bold">
              {parseFloat(r.value).toFixed(1)}
            </SvgText>
            <SvgText x={cx} y={H - P.b + 13} fontSize={8} fill="#94A3B8" textAnchor="middle">
              {r.date.slice(5)}
            </SvgText>
          </G>
        );
      })}
      <Line x1={P.l} y1={P.t} x2={P.l} y2={P.t + gH} stroke="#E2E8F0" strokeWidth={1} />
      <Line x1={P.l} y1={P.t + gH} x2={P.l + gW} y2={P.t + gH} stroke="#E2E8F0" strokeWidth={1} />
    </Svg>
  );
}

// ─── Add Lab Manual ─────────────────────────────────────────

function AddLabManual({ onClose }: { onClose: () => void }) {
  const { tokens } = useTheme();
  const t = useT();
  const create = useCreateLabReport();
  const [date, setDate] = useState(today());
  const [cat, setCat] = useState('CBC');
  const [search, setSearch] = useState('');
  const [vals, setVals] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');

  const tests = LAB_TESTS.filter(
    (t) => (cat === 'All' || t.cat === cat) &&
      (!search || t.name.toLowerCase().includes(search.toLowerCase())),
  );
  const filled = Object.values(vals).some((v) => v !== '');

  const handleSave = async () => {
    if (!filled) return;
    const results: LabResultEntry[] = Object.entries(vals)
      .filter(([, v]) => v !== '')
      .map(([testId, value]) => ({ testId, value }));
    try {
      await create.mutateAsync({
        reportDate: date, results, source: 'manual', notes: notes || null,
      });
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Save failed';
      Alert.alert('Save failed', msg);
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: tokens.bg }}>
        <View style={{
          backgroundColor: '#0D9488', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 14,
        }}>
          <Pressable accessibilityRole="button" onPress={onClose}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 6,
              alignSelf: 'flex-start', marginBottom: 8,
            }}>
            <ArrowLeft size={16} color="white" />
          </Pressable>
          <Text style={{ fontSize: 20, fontWeight: '900', color: 'white' }}>{t('add_lab_results')}</Text>
          <Text style={{ fontSize: 12, color: 'white', opacity: 0.85 }}>
            {t('enter_values')}
          </Text>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 13, paddingBottom: 30 }}>
          <Lbl tokens={tokens}>{t('report_date')}</Lbl>
          <TextInput
            value={date} onChangeText={setDate} placeholder="YYYY-MM-DD"
            placeholderTextColor={tokens.text2} style={inputStyle(tokens)}
          />

          <View style={{
            backgroundColor: tokens.card, borderRadius: 10, padding: 9, marginBottom: 10,
            borderWidth: 2, borderColor: tokens.border,
            flexDirection: 'row', alignItems: 'center', gap: 7,
          }}>
            <Search size={14} color={tokens.text2} />
            <TextInput
              value={search} onChangeText={setSearch} placeholder={t('search_test')}
              placeholderTextColor={tokens.text2}
              style={{ flex: 1, fontSize: 13, color: tokens.text, fontWeight: '600' }}
            />
            {search ? (
              <Pressable accessibilityRole="button" onPress={() => setSearch('')}>
                <X size={13} color={tokens.text2} />
              </Pressable>
            ) : null}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 5, paddingBottom: 6 }}
            style={{ marginBottom: 12 }}>
            {LAB_CATS.map((c) => (
              <Pressable
                key={c} accessibilityRole="button"
                onPress={() => { setCat(c); setSearch(''); }}
                style={{
                  backgroundColor: cat === c ? '#0D9488' : tokens.card2,
                  borderWidth: 2, borderColor: cat === c ? '#0D9488' : tokens.border,
                  borderRadius: 50, paddingHorizontal: 11, paddingVertical: 5,
                }}>
                <Text style={{
                  color: cat === c ? 'white' : tokens.text2,
                  fontWeight: '700', fontSize: 12,
                }}>{c}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {tests.map((lt) => {
            const v = vals[lt.id] || '';
            const f = v ? flagVal(lt, v) : null;
            return (
              <View key={lt.id} style={{
                backgroundColor: tokens.card, borderRadius: 11, padding: 11, marginBottom: 7,
                borderWidth: 2,
                borderColor: f && f !== 'normal' && f !== 'qual' && f !== 'none' ? flagClr(f) : tokens.border,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '800', fontSize: 13, color: tokens.text }}>{lt.name}</Text>
                    <Text style={{ fontSize: 10, color: tokens.text2, fontWeight: '600' }}>
                      {lt.cat}{lt.unit ? ` · ${lt.unit}` : ''}
                      {lt.nMin !== null ? ` · ${t('normal_range_label')} ${lt.nMin}–${lt.nMax !== null && lt.nMax < 999 ? lt.nMax : '+'}` : ''}
                    </Text>
                  </View>
                  {f ? (
                    <View style={{
                      backgroundColor: flagBg(f), borderWidth: 1, borderColor: flagClr(f),
                      borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2,
                    }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: flagClr(f) }}>{flagLbl(f)}</Text>
                    </View>
                  ) : null}
                </View>
                {lt.qualitative ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                    {QUAL_OPTS.map((opt) => (
                      <Pressable
                        key={opt} accessibilityRole="button"
                        onPress={() => setVals({ ...vals, [lt.id]: v === opt ? '' : opt })}
                        style={{
                          backgroundColor: v === opt ? '#8B5CF6' : tokens.card2,
                          borderWidth: 2, borderColor: v === opt ? '#8B5CF6' : tokens.border,
                          borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4,
                        }}>
                        <Text style={{
                          color: v === opt ? 'white' : tokens.text2,
                          fontWeight: '700', fontSize: 11,
                        }}>{opt}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <TextInput
                    value={v}
                    onChangeText={(s) => setVals({ ...vals, [lt.id]: s })}
                    placeholder={`Value${lt.unit ? ` (${lt.unit})` : ''}...`}
                    placeholderTextColor={tokens.text2}
                    keyboardType="decimal-pad"
                    style={{
                      borderWidth: 2, borderColor: tokens.border, borderRadius: 9,
                      paddingHorizontal: 10, paddingVertical: 9, fontSize: 16, fontWeight: '700',
                      backgroundColor: tokens.input, color: tokens.text,
                    }}
                  />
                )}
              </View>
            );
          })}

          <Lbl tokens={tokens}>{t('notes')}</Lbl>
          <TextInput
            value={notes} onChangeText={setNotes}
            placeholder="e.g. Fasting sample, Metropolis lab..."
            placeholderTextColor={tokens.text2}
            multiline
            style={[inputStyle(tokens), { minHeight: 60, textAlignVertical: 'top' }]}
          />

          <Pressable
            accessibilityRole="button"
            disabled={!filled || create.isPending}
            onPress={handleSave}
            style={{
              backgroundColor: !filled ? '#CBD5E1' : '#0D9488',
              borderRadius: 12, padding: 13,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}>
            {create.isPending ? <Loader2 size={16} color="white" /> : null}
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>{t('save_lab_report_btn')}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Scan Lab ─────────────────────────────────────────

function ScanLab({ onClose }: { onClose: () => void }) {
  const { tokens } = useTheme();
  const t = useT();
  const scan = useScanLabReport();
  const create = useCreateLabReport();

  const [file, setFile] = useState<SelectedFile | null>(null);
  const [extracted, setExtracted] = useState<{ reportDate: string | null; results: LabResultEntry[] } | null>(null);
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const [date, setDate] = useState(today());
  const [error, setError] = useState('');

  const pickPhoto = async (fromCamera: boolean) => {
    setError('');
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : Platform.OS === 'web'
        ? { granted: true }
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('permission_needed'), t('permission_grant_scan'));
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (result.canceled) return;
    const a = result.assets[0];
    if (!a) return;
    setFile({ uri: a.uri, mimeType: a.mimeType ?? 'image/jpeg', name: a.fileName ?? 'lab.jpg' });
    setExtracted(null);
  };

  const pickPdf = async () => {
    setError('');
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (result.canceled) return;
    const a = result.assets[0];
    if (!a) return;
    setFile({ uri: a.uri, mimeType: a.mimeType ?? 'application/pdf', name: a.name ?? 'lab.pdf' });
    setExtracted(null);
  };

  const doScan = async () => {
    if (!file) return;
    setError('');
    try {
      const upload = await buildUploadFile(file);
      const tests = LAB_TESTS.map((t) => [t.id, t.name, t.unit] as const);
      const result = await scan.mutateAsync({ file: upload, tests });
      if (!result.results || result.results.length === 0) {
        setError('No test values found. Try a clearer photo.');
        return;
      }
      const s: Record<string, boolean> = {};
      result.results.forEach((r) => { s[r.testId] = true; });
      setSel(s);
      if (result.reportDate) setDate(result.reportDate);
      setExtracted(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not read report.';
      setError(msg);
    }
  };

  const handleSave = async () => {
    if (!extracted) return;
    const results = extracted.results.filter((r) => sel[r.testId]);
    if (results.length === 0) return;
    try {
      await create.mutateAsync({ reportDate: date, results, source: 'scan' });
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Save failed';
      Alert.alert('Save failed', msg);
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: tokens.bg }}>
        <View style={{
          backgroundColor: '#0D9488', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 14,
        }}>
          <Pressable accessibilityRole="button" onPress={onClose}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 6,
              alignSelf: 'flex-start', marginBottom: 8,
            }}>
            <ArrowLeft size={16} color="white" />
          </Pressable>
          <Text style={{ fontSize: 20, fontWeight: '900', color: 'white' }}>{t('scan_lab_report')}</Text>
          <Text style={{ fontSize: 12, color: 'white', opacity: 0.85 }}>
            {t('ai_extracts_auto')}
          </Text>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 13, paddingBottom: 30 }}>
          {!extracted ? (
            <>
              <View style={{
                backgroundColor: tokens.card, borderWidth: 2, borderColor: tokens.border,
                borderStyle: 'dashed', borderRadius: 12, padding: 18, alignItems: 'center',
                marginBottom: 10,
              }}>
                {file ? (
                  <Text style={{ fontSize: 13, color: tokens.text, fontWeight: '700' }}>
                    {file.name}
                  </Text>
                ) : (
                  <>
                    <Text style={{ fontSize: 36, marginBottom: 7 }}>🧪</Text>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: tokens.text }}>
                      {t('upload_lab_report')}
                    </Text>
                    <Text style={{ fontSize: 11, color: tokens.text2, marginTop: 3 }}>
                      {t('photo_or_pdf_hint')}
                    </Text>
                  </>
                )}
              </View>
              <View style={{ flexDirection: 'row', gap: 7, marginBottom: 10 }}>
                <Pressable
                  accessibilityRole="button" onPress={() => pickPhoto(true)}
                  style={pickBtn(tokens)}>
                  <Text style={pickBtnText}>📷 Camera</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button" onPress={() => pickPhoto(false)}
                  style={pickBtn(tokens)}>
                  <Text style={pickBtnText}>🖼️ Gallery</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button" onPress={pickPdf}
                  style={pickBtn(tokens)}>
                  <Text style={pickBtnText}>📄 PDF</Text>
                </Pressable>
              </View>

              {file && !scan.isPending ? (
                <Pressable
                  accessibilityRole="button" onPress={doScan}
                  style={{
                    backgroundColor: '#0D9488', borderRadius: 11, padding: 12,
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
                    marginBottom: 10,
                  }}>
                  <Sparkles size={15} color="white" />
                  <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>{t('read_report')}</Text>
                </Pressable>
              ) : null}

              {scan.isPending ? (
                <View style={{
                  backgroundColor: tokens.card, borderRadius: 10, padding: 16, alignItems: 'center',
                  borderWidth: 2, borderColor: tokens.border,
                }}>
                  <ActivityIndicator size="large" color="#0D9488" />
                  <Text style={{ fontWeight: '800', fontSize: 14, color: tokens.text, marginTop: 8 }}>
                    {t('reading_lab_report')}
                  </Text>
                </View>
              ) : null}

              {error ? (
                <View style={{
                  backgroundColor: '#FEF2F2', borderWidth: 2, borderColor: '#FCA5A5',
                  borderRadius: 10, padding: 11, alignItems: 'center', marginTop: 6,
                }}>
                  <AlertTriangle size={20} color="#EF4444" />
                  <Text style={{ fontWeight: '800', color: '#991B1B', fontSize: 13, marginTop: 6 }}>
                    {t('could_not_read_report')}
                  </Text>
                  <Text style={{ color: '#DC2626', fontSize: 11, marginTop: 3, textAlign: 'center' }}>
                    {error}
                  </Text>
                </View>
              ) : null}
            </>
          ) : (
            <>
              <View style={{
                backgroundColor: '#10B981', borderRadius: 12, padding: 12, marginBottom: 11,
                flexDirection: 'row', alignItems: 'center', gap: 7,
              }}>
                <Sparkles size={16} color="white" />
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>
                  {t('found_tests', { n: extracted.results.length })}
                </Text>
              </View>
              <Lbl tokens={tokens}>{t('report_date')}</Lbl>
              <TextInput
                value={date} onChangeText={setDate} placeholder="YYYY-MM-DD"
                placeholderTextColor={tokens.text2}
                style={inputStyle(tokens)}
              />
              {extracted.results.map((r, i) => {
                const t = LAB_TESTS.find((x) => x.id === r.testId);
                const f = t ? flagVal(t, r.value) : 'none';
                const isSel = sel[r.testId] !== false;
                return (
                  <Pressable
                    accessibilityRole="button"
                    key={i}
                    onPress={() => setSel({ ...sel, [r.testId]: !isSel })}
                    style={{
                      backgroundColor: isSel ? tokens.card : tokens.card2,
                      borderRadius: 11, padding: 10, marginBottom: 7,
                      borderWidth: 2, borderColor: isSel ? flagClr(f) : tokens.border,
                      flexDirection: 'row', alignItems: 'center', gap: 9,
                    }}>
                    <View style={{
                      width: 20, height: 20, borderRadius: 50,
                      backgroundColor: isSel ? flagClr(f) : tokens.border,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isSel ? <Check size={12} color="white" /> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '800', fontSize: 13, color: tokens.text }}>
                        {t?.name ?? r.testId}
                      </Text>
                      <Text style={{ fontSize: 10, color: tokens.text2, fontWeight: '600' }}>
                        {t?.cat ?? ''}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', marginRight: 6 }}>
                      <Text style={{ fontWeight: '900', fontSize: 15, color: flagClr(f) }}>{r.value}</Text>
                      <Text style={{ fontSize: 10, color: tokens.text2 }}>{t?.unit ?? ''}</Text>
                    </View>
                    <View style={{
                      backgroundColor: flagBg(f), borderWidth: 1, borderColor: flagClr(f),
                      borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2,
                    }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: flagClr(f) }}>{flagLbl(f)}</Text>
                    </View>
                  </Pressable>
                );
              })}
              <Pressable
                accessibilityRole="button"
                disabled={create.isPending || !Object.values(sel).some(Boolean)}
                onPress={handleSave}
                style={{
                  backgroundColor: '#0D9488', borderRadius: 12, padding: 13,
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
                  marginTop: 8,
                }}>
                {create.isPending ? <Loader2 size={16} color="white" /> : null}
                <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }}>
                  {t('save_lab_report_final')}
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const pickBtnText = { fontSize: 12, fontWeight: '700' as const, color: '#0D9488' };
function pickBtn(tokens: ReturnType<typeof useTheme>['tokens']) {
  return {
    flex: 1, backgroundColor: tokens.card, borderRadius: 10, padding: 11,
    borderWidth: 2, borderColor: tokens.border, alignItems: 'center' as const,
  };
}

function Lbl({ children, tokens }: { children: React.ReactNode; tokens: ReturnType<typeof useTheme>['tokens'] }) {
  return (
    <Text style={{ fontWeight: '800', color: tokens.text2, fontSize: 13, marginBottom: 5 }}>
      {children}
    </Text>
  );
}

function inputStyle(tokens: ReturnType<typeof useTheme>['tokens']) {
  return {
    width: '100%' as const,
    borderWidth: 2,
    borderColor: tokens.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600' as const,
    backgroundColor: tokens.input,
    color: tokens.text,
    marginBottom: 12,
  };
}

// Re-export for tree-shaking transparency
export { ChevronRight };
