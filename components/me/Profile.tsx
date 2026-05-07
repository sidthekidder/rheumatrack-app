import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import {
  Bell,
  BellOff,
  Monitor,
  Moon,
  Sun,
  User,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useMedicines, usePatchPatient, usePatient } from '@/lib/queries';
import { requestPermissions, scheduleAllReminders } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { useTheme, type ThemeMode } from '@/lib/themeStore';
import DoctorSection from './DoctorSection';
import LanguageToggle from './LanguageToggle';
import QRPlaceholder from './QRPlaceholder';

interface ProfileForm {
  name: string;
  age: string;
  patientId: string;
  city: string;
  state: string;
  country: string;
}

const THEME_OPTIONS: ReadonlyArray<{
  id: ThemeMode;
  label: string;
  Icon: typeof Sun;
}> = [
  { id: 'light', label: 'Light', Icon: Sun },
  { id: 'dark', label: 'Dark', Icon: Moon },
  { id: 'system', label: 'System', Icon: Monitor },
];

export default function Profile() {
  const { tokens, mode, setMode } = useTheme();
  const patientQ = usePatient();
  const patchPatient = usePatchPatient();
  const medsQ = useMedicines();
  const patient = patientQ.data ?? null;

  const [editP, setEditP] = useState(false);
  const [pF, setPF] = useState<ProfileForm>({
    name: '',
    age: '',
    patientId: '',
    city: '',
    state: '',
    country: 'India',
  });
  const [notifGranted, setNotifGranted] = useState(false);

  // Refresh notification permission state on mount.
  useEffect(() => {
    let alive = true;
    Notifications.getPermissionsAsync()
      .then((res) => {
        if (alive) setNotifGranted(res.status === 'granted');
      })
      .catch(() => {
        /* noop — permission API may be unavailable on web */
      });
    return () => {
      alive = false;
    };
  }, []);

  const openProfileEdit = () => {
    setPF({
      name: patient?.name ?? '',
      age: patient?.age != null ? String(patient.age) : '',
      patientId: patient?.patientId ?? '',
      city: patient?.city ?? '',
      state: patient?.state ?? '',
      country: patient?.country ?? 'India',
    });
    setEditP(true);
  };

  const saveProfile = async () => {
    const ageTrim = pF.age.trim();
    const ageNum = ageTrim === '' ? null : Number(ageTrim);
    if (ageTrim !== '' && (!Number.isFinite(ageNum) || ageNum! < 0)) {
      Alert.alert('Invalid age', 'Please enter a valid age.');
      return;
    }
    try {
      await patchPatient.mutateAsync({
        name: pF.name.trim() || patient?.name || '',
        age: ageNum,
        patientId: pF.patientId.trim() || null,
        city: pF.city.trim() || null,
        state: pF.state.trim() || null,
        country: pF.country.trim() || null,
      });
      setEditP(false);
    } catch (err) {
      Alert.alert(
        'Could not save',
        err instanceof Error ? err.message : 'Unknown error',
      );
    }
  };

  const requestNotif = async () => {
    try {
      const granted = await requestPermissions();
      setNotifGranted(granted);
      if (!granted) {
        Alert.alert(
          'Notifications blocked',
          'Enable notifications in your system settings to receive reminders.',
        );
        return;
      }
      // Immediate first schedule so reminders kick in without waiting for the next med-list refetch.
      await scheduleAllReminders(medsQ.data ?? []);
    } catch {
      Alert.alert(
        'Not supported',
        'Notifications cannot be enabled on this device.',
      );
    }
  };

  const callEmergency = () => {
    Linking.openURL('tel:112').catch(() => {
      /* noop */
    });
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      Alert.alert(
        'Sign out failed',
        err instanceof Error ? err.message : 'Unknown error',
      );
    }
  };

  if (patientQ.isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: tokens.text2 }}>Loading...</Text>
      </View>
    );
  }

  const inputStyle = {
    width: '100%' as const,
    borderWidth: 2,
    borderColor: tokens.border,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 13,
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 11,
    backgroundColor: tokens.input,
    color: tokens.text,
  };

  const saving = patchPatient.isPending;
  const cityStateCountry = [patient.city, patient.state, patient.country]
    .filter(Boolean)
    .join(', ');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ padding: 13 }}>
          {/* My Profile */}
          <Section title="My Profile" tokens={tokens}>
            {!editP ? (
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <LinearGradient
                    colors={['#0D9488', '#0284C7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 13,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <User size={23} color="white" />
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontWeight: '800',
                        fontSize: 16,
                        color: tokens.text,
                      }}
                    >
                      {patient.name || '—'}
                    </Text>
                    {cityStateCountry ? (
                      <Text
                        style={{
                          fontSize: 12,
                          color: tokens.text2,
                          fontWeight: '600',
                        }}
                      >
                        {cityStateCountry}
                      </Text>
                    ) : null}
                    {patient.patientId ? (
                      <Text
                        style={{
                          fontSize: 11,
                          color: '#0D9488',
                          fontWeight: '700',
                        }}
                      >
                        ID: {patient.patientId}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Edit profile"
                  onPress={openProfileEdit}
                  style={{
                    backgroundColor: tokens.card2,
                    borderWidth: 2,
                    borderColor: tokens.border,
                    borderRadius: 9,
                    paddingVertical: 9,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontWeight: '700',
                      fontSize: 13,
                      color: tokens.text,
                    }}
                  >
                    ✏️ Edit Profile
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View>
                <TextInput
                  value={pF.name}
                  onChangeText={(v) => setPF({ ...pF, name: v })}
                  placeholder="Name"
                  placeholderTextColor={tokens.text2}
                  style={inputStyle}
                />
                <View style={{ flexDirection: 'row', gap: 9 }}>
                  <TextInput
                    value={pF.age}
                    onChangeText={(v) =>
                      setPF({ ...pF, age: v.replace(/[^0-9]/g, '') })
                    }
                    placeholder="Age"
                    placeholderTextColor={tokens.text2}
                    keyboardType="numeric"
                    style={[inputStyle, { flex: 1 }]}
                  />
                  <TextInput
                    value={pF.patientId}
                    onChangeText={(v) => setPF({ ...pF, patientId: v })}
                    placeholder="Patient ID"
                    placeholderTextColor={tokens.text2}
                    style={[inputStyle, { flex: 1 }]}
                  />
                </View>
                <TextInput
                  value={pF.city}
                  onChangeText={(v) => setPF({ ...pF, city: v })}
                  placeholder="City"
                  placeholderTextColor={tokens.text2}
                  style={inputStyle}
                />
                <View style={{ flexDirection: 'row', gap: 9 }}>
                  <TextInput
                    value={pF.state}
                    onChangeText={(v) => setPF({ ...pF, state: v })}
                    placeholder="State"
                    placeholderTextColor={tokens.text2}
                    style={[inputStyle, { flex: 1 }]}
                  />
                  <TextInput
                    value={pF.country}
                    onChangeText={(v) => setPF({ ...pF, country: v })}
                    placeholder="Country"
                    placeholderTextColor={tokens.text2}
                    style={[inputStyle, { flex: 1 }]}
                  />
                </View>
                <FormButtons
                  tokens={tokens}
                  saving={saving}
                  onCancel={() => setEditP(false)}
                  onSave={saveProfile}
                />
              </View>
            )}
          </Section>

          {/* Doctor Contact */}
          <DoctorSection />

          {/* Theme */}
          <Section title="Theme" tokens={tokens}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {THEME_OPTIONS.map(({ id, label, Icon }) => {
                const selected = mode === id;
                return (
                  <Pressable
                    key={id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={label}
                    onPress={() => setMode(id)}
                    style={{
                      flex: 1,
                      backgroundColor: selected ? '#0D9488' : tokens.card2,
                      borderWidth: 2,
                      borderColor: selected ? '#0D9488' : tokens.border,
                      borderRadius: 11,
                      paddingVertical: 11,
                      paddingHorizontal: 7,
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <Icon
                      size={15}
                      color={selected ? 'white' : tokens.text2}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: selected ? 'white' : tokens.text2,
                      }}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Section>

          {/* Reminders */}
          <Section title="Reminders" tokens={tokens}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 11,
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 11,
                  backgroundColor: notifGranted ? '#D1FAE5' : '#FEE2E2',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {notifGranted ? (
                  <Bell size={20} color="#16A34A" />
                ) : (
                  <BellOff size={20} color="#DC2626" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontWeight: '800',
                    color: tokens.text,
                    fontSize: 14,
                  }}
                >
                  {notifGranted ? 'Enabled' : 'Tap Enable'}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: tokens.text2,
                    fontWeight: '600',
                    marginTop: 1,
                  }}
                >
                  Notifications required for reminders to work
                </Text>
              </View>
              {!notifGranted ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Enable notifications"
                  onPress={requestNotif}
                  style={{
                    backgroundColor: '#0D9488',
                    borderRadius: 9,
                    paddingVertical: 8,
                    paddingHorizontal: 13,
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: '700',
                      fontSize: 13,
                    }}
                  >
                    Enable
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </Section>

          {/* Language */}
          <LanguageToggle />

          {/* QR Code */}
          <QRPlaceholder />

          {/* Emergency */}
          <Section tokens={tokens}>
            <View style={{ alignItems: 'center' }}>
              <Text
                style={{
                  fontWeight: '800',
                  color: tokens.text,
                  fontSize: 15,
                  marginBottom: 4,
                }}
              >
                🚨 Emergency
              </Text>
              <Text
                style={{
                  color: tokens.text2,
                  fontSize: 13,
                  marginBottom: 11,
                }}
              >
                For medical emergencies, call 112
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Call 112"
                onPress={callEmergency}
                style={{
                  backgroundColor: '#EF4444',
                  borderRadius: 11,
                  paddingVertical: 11,
                  width: '100%',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontWeight: '800',
                    fontSize: 15,
                  }}
                >
                  📞 Call 112
                </Text>
              </Pressable>
            </View>
          </Section>

          {/* Sign out */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            onPress={signOut}
            style={{
              backgroundColor: tokens.card2,
              borderWidth: 2,
              borderColor: tokens.border,
              borderRadius: 11,
              paddingVertical: 12,
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                color: '#DC2626',
                fontWeight: '800',
                fontSize: 15,
              }}
            >
              Sign out
            </Text>
          </Pressable>

          {/* Footer */}
          <View style={{ alignItems: 'center', marginBottom: 8 }}>
            <Text
              style={{
                fontSize: 12,
                color: tokens.text2,
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              RheumaTrack v1.0 · Made for Rheumatology patients ❤️
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface SectionProps {
  title?: string;
  tokens: ReturnType<typeof useTheme>['tokens'];
  children: ReactNode;
}

function Section({ title, tokens, children }: SectionProps) {
  return (
    <View
      style={{
        backgroundColor: tokens.card,
        borderRadius: 14,
        padding: 14,
        marginBottom: 11,
        borderWidth: 2,
        borderColor: tokens.border,
      }}
    >
      {title ? (
        <Text
          style={{
            fontWeight: '800',
            color: tokens.text2,
            fontSize: 11,
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

interface FormButtonsProps {
  tokens: ReturnType<typeof useTheme>['tokens'];
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

function FormButtons({ tokens, saving, onCancel, onSave }: FormButtonsProps) {
  return (
    <View style={{ flexDirection: 'row', gap: 9 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cancel"
        onPress={onCancel}
        disabled={saving}
        style={{
          flex: 1,
          backgroundColor: tokens.card2,
          borderRadius: 9,
          paddingVertical: 10,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontWeight: '700', fontSize: 15, color: tokens.text2 }}>
          Cancel
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Save"
        accessibilityState={{ disabled: saving }}
        onPress={onSave}
        disabled={saving}
        style={{
          flex: 1,
          backgroundColor: '#0D9488',
          borderRadius: 9,
          paddingVertical: 10,
          alignItems: 'center',
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ fontWeight: '700', fontSize: 15, color: 'white' }}>
            Save
          </Text>
        )}
      </Pressable>
    </View>
  );
}
