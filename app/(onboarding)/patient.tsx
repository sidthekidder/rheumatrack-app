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
import { useOnboardingStore } from '../../lib/onboardingStore';
import { useT } from '@/lib/i18n/useT';

export default function PatientDetails() {
  const t = useT();
  const router = useRouter();
  const { tokens } = useTheme();
  const p = useOnboardingStore((s) => s.patient);
  const setPatient = useOnboardingStore((s) => s.setPatient);

  const valid = p.name.trim().length > 0 && p.city.trim().length > 0;

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
            {t('your_details')}
          </Text>
          <Text
            style={{
              fontSize: 13,
              opacity: 0.8,
              color: 'white',
              marginTop: 2,
            }}
          >
            {t('step_1_of_2')}
          </Text>
          <ProgressDots total={2} current={0} />
        </LinearGradient>

        <View style={{ padding: 16 }}>
          <Lbl>{t('onb_full_name_req')}</Lbl>
          <TextInput
            value={p.name}
            onChangeText={(v) => setPatient({ ...p, name: v })}
            placeholder={t('onb_name_placeholder')}
            placeholderTextColor={tokens.text2}
            style={inp}
          />

          <View style={{ flexDirection: 'row', gap: 9 }}>
            <View style={{ flex: 1 }}>
              <Lbl>{t('age')}</Lbl>
              <TextInput
                value={p.age}
                onChangeText={(v) => setPatient({ ...p, age: v })}
                placeholder={t('onb_age_placeholder')}
                placeholderTextColor={tokens.text2}
                keyboardType="number-pad"
                style={inp}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Lbl>{t('patient_id')}</Lbl>
              <TextInput
                value={p.patientId}
                onChangeText={(v) => setPatient({ ...p, patientId: v })}
                placeholder={t('onb_optional')}
                placeholderTextColor={tokens.text2}
                style={inp}
              />
            </View>
          </View>

          <Lbl>{t('onb_city_req')}</Lbl>
          <TextInput
            value={p.city}
            onChangeText={(v) => setPatient({ ...p, city: v })}
            placeholder={t('onb_city_placeholder')}
            placeholderTextColor={tokens.text2}
            style={inp}
          />

          <View style={{ flexDirection: 'row', gap: 9 }}>
            <View style={{ flex: 1 }}>
              <Lbl>{t('state')}</Lbl>
              <TextInput
                value={p.state}
                onChangeText={(v) => setPatient({ ...p, state: v })}
                placeholderTextColor={tokens.text2}
                style={inp}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Lbl>{t('country')}</Lbl>
              <TextInput
                value={p.country}
                onChangeText={(v) => setPatient({ ...p, country: v })}
                placeholderTextColor={tokens.text2}
                style={inp}
              />
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !valid }}
            disabled={!valid}
            onPress={() => {
              if (!valid) return;
              router.push('/(onboarding)/doctor');
            }}
            style={{ borderRadius: 13, overflow: 'hidden' }}
          >
            {valid ? (
              <LinearGradient
                colors={['#0D9488', '#0284C7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingVertical: 14, alignItems: 'center' }}
              >
                <Text
                  style={{ color: 'white', fontWeight: '900', fontSize: 17 }}
                >
                  {t('continue')}
                </Text>
              </LinearGradient>
            ) : (
              <View
                style={{
                  backgroundColor: '#CBD5E1',
                  paddingVertical: 14,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{ color: 'white', fontWeight: '900', fontSize: 17 }}
                >
                  {t('continue')}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
