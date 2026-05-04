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

export default function PatientDetails() {
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
            Your Details
          </Text>
          <Text
            style={{
              fontSize: 13,
              opacity: 0.8,
              color: 'white',
              marginTop: 2,
            }}
          >
            Step 1 of 2
          </Text>
          <ProgressDots total={2} current={0} />
        </LinearGradient>

        <View style={{ padding: 16 }}>
          <Lbl>Full Name *</Lbl>
          <TextInput
            value={p.name}
            onChangeText={(v) => setPatient({ ...p, name: v })}
            placeholder="e.g. Rajesh Kumar"
            placeholderTextColor={tokens.text2}
            style={inp}
          />

          <View style={{ flexDirection: 'row', gap: 9 }}>
            <View style={{ flex: 1 }}>
              <Lbl>Age</Lbl>
              <TextInput
                value={p.age}
                onChangeText={(v) => setPatient({ ...p, age: v })}
                placeholder="55"
                placeholderTextColor={tokens.text2}
                keyboardType="number-pad"
                style={inp}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Lbl>Patient ID</Lbl>
              <TextInput
                value={p.patientId}
                onChangeText={(v) => setPatient({ ...p, patientId: v })}
                placeholder="optional"
                placeholderTextColor={tokens.text2}
                style={inp}
              />
            </View>
          </View>

          <Lbl>City *</Lbl>
          <TextInput
            value={p.city}
            onChangeText={(v) => setPatient({ ...p, city: v })}
            placeholder="e.g. Nagpur"
            placeholderTextColor={tokens.text2}
            style={inp}
          />

          <View style={{ flexDirection: 'row', gap: 9 }}>
            <View style={{ flex: 1 }}>
              <Lbl>State</Lbl>
              <TextInput
                value={p.state}
                onChangeText={(v) => setPatient({ ...p, state: v })}
                placeholderTextColor={tokens.text2}
                style={inp}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Lbl>Country</Lbl>
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
                  Continue →
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
                  Continue →
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
