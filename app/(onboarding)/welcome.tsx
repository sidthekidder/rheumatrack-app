import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/themeStore';
import { useT } from '@/lib/i18n/useT';

export default function Welcome() {
  const t = useT();
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
        {t('onb_tagline_sub')}
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
        {([
          t('onb_feature_scan'),
          t('onb_feature_reminders'),
          t('onb_feature_calendar'),
          t('onb_feature_whatsapp'),
        ] as string[]).map((line, i, arr) => (
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
            {t('get_started')}
          </Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}
