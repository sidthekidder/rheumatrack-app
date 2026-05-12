import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TopTabs } from '@/lib/topTabs';
import { useTheme } from '@/lib/themeStore';
import { useT } from '@/lib/i18n/useT';

export default function MeLayout() {
  const { tokens } = useTheme();
  const t = useT();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: tokens.bg }}>
      <StatusBar style="dark" />
      <TopTabs
        screenOptions={{
          tabBarStyle: { backgroundColor: tokens.card, elevation: 0 },
          tabBarLabelStyle: {
            fontWeight: '700',
            fontSize: 11,
            textTransform: 'none',
            marginHorizontal: 0,
          },
          tabBarItemStyle: { paddingHorizontal: 4 },
          tabBarIndicatorStyle: { backgroundColor: '#0D9488', height: 3 },
          tabBarActiveTintColor: '#0D9488',
          tabBarInactiveTintColor: tokens.text2,
        }}
      >
        <TopTabs.Screen name="index" options={{ title: t('health_card') }} />
        <TopTabs.Screen name="appointments" options={{ title: t('appointments') }} />
        <TopTabs.Screen name="profile" options={{ title: t('profile') }} />
      </TopTabs>
    </SafeAreaView>
  );
}
