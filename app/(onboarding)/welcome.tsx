import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/themeStore';

export default function Welcome() {
  const router = useRouter();
  const { tokens } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: tokens.bg,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 26,
      }}
    >
      <Text style={{ fontSize: 60, marginBottom: 8 }}>💊</Text>
      <Text
        style={{
          fontSize: 30,
          fontWeight: '900',
          color: '#0D9488',
          marginBottom: 4,
        }}
      >
        RheumaTrack
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: tokens.text2,
          fontWeight: '600',
          marginBottom: 30,
          maxWidth: 280,
          textAlign: 'center',
        }}
      >
        Personal medicine reminder & health guide for Rheumatology patients
      </Text>

      <View
        style={{
          backgroundColor: tokens.card,
          borderRadius: 14,
          padding: 18,
          marginBottom: 24,
          borderWidth: 2,
          borderColor: tokens.border,
          width: '100%',
        }}
      >
        {[
          '📷  Scan your prescription with AI',
          '💊  Auto-set reminders for every medicine',
          '📅  Track compliance on calendar',
          '👨‍⚕️  One-tap WhatsApp to your doctor',
        ].map((line, i, arr) => (
          <Text
            key={i}
            style={{
              fontSize: 14,
              color: tokens.text,
              fontWeight: '600',
              lineHeight: 24,
              marginBottom: i < arr.length - 1 ? 8 : 0,
            }}
          >
            {line}
          </Text>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/(onboarding)/patient')}
        style={{ width: '100%', borderRadius: 14, overflow: 'hidden' }}
      >
        <LinearGradient
          colors={['#0D9488', '#0284C7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingVertical: 14, alignItems: 'center' }}
        >
          <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>
            Get Started →
          </Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}
