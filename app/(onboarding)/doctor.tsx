import { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import ProgressDots from '../../components/ProgressDots';
import { useTheme } from '../../lib/themeStore';
import { useUpsertPatient } from '../../lib/queries';
import type { PatientCreate } from '../../lib/api';
import { useOnboardingStore } from '../../lib/onboardingStore';
import { useT } from '@/lib/i18n/useT';

interface DoctorForm {
  name: string;
  specialty: string;
  phone: string;
  hospital: string;
}


export default function DoctorDetails() {
  const t = useT();
  const router = useRouter();
  const { tokens } = useTheme();
  const upsert = useUpsertPatient();
  const patient = useOnboardingStore((s) => s.patient);

  const [d, setD] = useState<DoctorForm>({
    name: 'Dr. Tanmay Gandhi',
    specialty: 'Rheumatologist',
    phone: '9730654325',
    hospital: '',
  });
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const phoneDigits = d.phone.replace(/\D/g, '');
  const phoneValid = phoneDigits.length >= 10;
  const submitValid = d.name.trim().length > 0 && phoneValid;

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
    if (includeDoctor && !submitValid) return;
    upsert.mutate(buildPayload(includeDoctor), {
      onSettled: (_data, error) => {
        if (!error) {
          // Auth gate handles routing to /(tabs) once usePatient refetches.
          useOnboardingStore.getState().reset();
        }
      },
      onError: (e) => setErrMsg(e.message ?? t('onb_failed_save')),
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
            accessibilityRole="button"
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
            {t('your_doctor')}
          </Text>
          <Text
            style={{
              fontSize: 13,
              opacity: 0.8,
              color: 'white',
              marginTop: 2,
            }}
          >
            {t('step_2_of_2')}
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
              {t('onb_wa_hint_banner')}
            </Text>
          </View>

          <Lbl>{t('onb_doctor_name_req')}</Lbl>
          <TextInput
            value={d.name}
            onChangeText={(v) => setD({ ...d, name: v })}
            placeholder={t('onb_doctor_placeholder')}
            placeholderTextColor={tokens.text2}
            style={inp}
          />

<Lbl>{`${t('whatsapp_number')} *`}</Lbl>
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
              placeholder={t('onb_phone_placeholder')}
              placeholderTextColor={tokens.text2}
              keyboardType="phone-pad"
              style={{ ...inp, flex: 1, marginBottom: 0 }}
            />
          </View>

          <Lbl>{t('hospital_clinic')}</Lbl>
          <TextInput
            value={d.hospital}
            onChangeText={(v) => setD({ ...d, hospital: v })}
            placeholder={t('onb_hospital_placeholder')}
            placeholderTextColor={tokens.text2}
            style={inp}
          />

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: busy }}
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
                {t('skip')}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !submitValid || busy }}
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
                    {t('onb_get_started_rocket')}
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
                    {busy ? t('onb_saving') : t('onb_get_started_rocket')}
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
