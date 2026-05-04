import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import ProgressDots from '../../components/ProgressDots';
import { useTheme } from '../../lib/themeStore';
import { useUpsertPatient } from '../../lib/queries';
import type { PatientCreate } from '../../lib/api';
import type { PatientForm } from './patient';

interface DoctorForm {
  name: string;
  specialty: string;
  phone: string;
  hospital: string;
}

const SPECIALTIES = [
  'Rheumatologist',
  'General Physician',
  'Orthopedic',
  'Immunologist',
  'Internal Medicine',
];

export default function DoctorDetails() {
  const router = useRouter();
  const { tokens } = useTheme();
  const params = useLocalSearchParams<{ p?: string }>();
  const upsert = useUpsertPatient();

  const patient: PatientForm = useMemo(() => {
    try {
      if (typeof params.p === 'string') return JSON.parse(params.p);
    } catch {
      // ignore malformed param
    }
    return {
      name: '',
      age: '',
      patientId: '',
      city: '',
      state: '',
      country: '',
    };
  }, [params.p]);

  const [d, setD] = useState<DoctorForm>({
    name: '',
    specialty: 'Rheumatologist',
    phone: '',
    hospital: '',
  });
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const submitValid = d.name.trim().length > 0 && d.phone.trim().length > 0;

  const buildPayload = (includeDoctor: boolean): PatientCreate => {
    const body: PatientCreate = {
      name: patient.name.trim(),
      age: patient.age ? Number(patient.age) : undefined,
      patientId: patient.patientId.trim() || undefined,
      city: patient.city.trim(),
      state: patient.state.trim() || undefined,
      country: patient.country.trim() || undefined,
    };
    if (includeDoctor) {
      body.doctorName = d.name.trim() || undefined;
      body.doctorSpecialty = d.specialty || undefined;
      body.doctorPhone = d.phone.trim() || undefined;
      body.doctorHospital = d.hospital.trim() || undefined;
    }
    return body;
  };

  const submit = (includeDoctor: boolean) => {
    setErrMsg(null);
    upsert.mutate(buildPayload(includeDoctor), {
      onSuccess: () => router.replace('/(tabs)'),
      onError: (e) => setErrMsg(e.message ?? 'Failed to save patient'),
    });
  };

  const inp = {
    width: '100%' as const,
    borderWidth: 2,
    borderColor: tokens.border,
    borderRadius: 11,
    paddingVertical: 11,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
    backgroundColor: tokens.input,
    color: tokens.text,
  };

  const Lbl = ({ children }: { children: string }) => (
    <Text
      style={{
        fontSize: 12,
        fontWeight: '700',
        color: tokens.text2,
        marginBottom: 6,
      }}
    >
      {children}
    </Text>
  );

  const busy = upsert.isPending;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: tokens.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={tokens.header.colors}
          start={tokens.header.start}
          end={tokens.header.end}
          style={{ paddingTop: 28, paddingHorizontal: 18, paddingBottom: 18 }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 8,
              padding: 6,
              marginBottom: 10,
              alignSelf: 'flex-start',
            }}
          >
            <ArrowLeft size={17} color="white" />
          </Pressable>
          <Text style={{ fontSize: 23, fontWeight: '900', color: 'white' }}>
            Your Doctor
          </Text>
          <Text
            style={{
              fontSize: 13,
              opacity: 0.8,
              color: 'white',
              marginTop: 2,
            }}
          >
            Step 2 of 2
          </Text>
          <ProgressDots total={2} current={1} />
        </LinearGradient>

        <View style={{ padding: 16 }}>
          <View
            style={{
              backgroundColor: '#F0FDFA',
              borderRadius: 13,
              paddingVertical: 11,
              paddingHorizontal: 13,
              marginBottom: 15,
              borderWidth: 2,
              borderColor: '#99F6E4',
            }}
          >
            <Text
              style={{ fontSize: 13, color: '#0D9488', fontWeight: '700' }}
            >
              💡 Doctor's WhatsApp will be saved for one-tap contact.
            </Text>
          </View>

          <Lbl>Doctor's Name *</Lbl>
          <TextInput
            value={d.name}
            onChangeText={(v) => setD({ ...d, name: v })}
            placeholder="e.g. Dr. Tanmay Agrawal"
            placeholderTextColor={tokens.text2}
            style={inp}
          />

          <Lbl>Specialty</Lbl>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 6,
              marginBottom: 11,
            }}
          >
            {SPECIALTIES.map((s) => {
              const sel = d.specialty === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => setD({ ...d, specialty: s })}
                  style={{
                    backgroundColor: sel ? '#0D9488' : tokens.card,
                    borderWidth: 1,
                    borderColor: sel ? '#0D9488' : tokens.border,
                    borderRadius: 999,
                    paddingVertical: 7,
                    paddingHorizontal: 12,
                  }}
                >
                  <Text
                    style={{
                      color: sel ? 'white' : tokens.text,
                      fontWeight: '700',
                      fontSize: 13,
                    }}
                  >
                    {s}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Lbl>WhatsApp Number *</Lbl>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 7,
              marginBottom: 11,
            }}
          >
            <View
              style={{
                backgroundColor: tokens.card2,
                borderRadius: 10,
                paddingVertical: 11,
                paddingHorizontal: 12,
              }}
            >
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 15,
                  color: tokens.text2,
                }}
              >
                +91
              </Text>
            </View>
            <TextInput
              value={d.phone}
              onChangeText={(v) => setD({ ...d, phone: v })}
              placeholder="98765 43210"
              placeholderTextColor={tokens.text2}
              keyboardType="phone-pad"
              style={{ ...inp, flex: 1, marginBottom: 0 }}
            />
          </View>

          <Lbl>Hospital / Clinic</Lbl>
          <TextInput
            value={d.hospital}
            onChangeText={(v) => setD({ ...d, hospital: v })}
            placeholder="e.g. Immunocare Clinic, Nagpur"
            placeholderTextColor={tokens.text2}
            style={inp}
          />

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              disabled={busy}
              onPress={() => submit(false)}
              style={{
                flex: 1,
                backgroundColor: tokens.card,
                borderWidth: 2,
                borderColor: tokens.border,
                borderRadius: 12,
                paddingVertical: 13,
                alignItems: 'center',
                opacity: busy ? 0.6 : 1,
              }}
            >
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 15,
                  color: tokens.text2,
                }}
              >
                Skip
              </Text>
            </Pressable>

            <Pressable
              disabled={!submitValid || busy}
              onPress={() => submit(true)}
              style={{ flex: 2, borderRadius: 12, overflow: 'hidden' }}
            >
              {submitValid && !busy ? (
                <LinearGradient
                  colors={['#0D9488', '#0284C7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ paddingVertical: 13, alignItems: 'center' }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: '900',
                      fontSize: 16,
                    }}
                  >
                    🚀 Get Started
                  </Text>
                </LinearGradient>
              ) : (
                <View
                  style={{
                    backgroundColor: '#CBD5E1',
                    paddingVertical: 13,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: '900',
                      fontSize: 16,
                    }}
                  >
                    {busy ? 'Saving…' : '🚀 Get Started'}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {errMsg ? (
            <Text
              style={{
                color: '#DC2626',
                fontSize: 13,
                fontWeight: '600',
                marginTop: 10,
                textAlign: 'center',
              }}
            >
              {errMsg}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
