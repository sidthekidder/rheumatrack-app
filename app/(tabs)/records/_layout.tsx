import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TopTabs } from '@/lib/topTabs';
import { useTheme } from '@/lib/themeStore';

export default function RecordsLayout() {
  const { tokens } = useTheme();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: tokens.bg }}>
      <StatusBar style="dark" />
      <TopTabs
        screenOptions={{
          tabBarStyle: { backgroundColor: tokens.card, elevation: 0 },
          tabBarLabelStyle: { fontWeight: '700', fontSize: 12, textTransform: 'none' },
          tabBarIndicatorStyle: { backgroundColor: '#0D9488', height: 3 },
          tabBarActiveTintColor: '#0D9488',
          tabBarInactiveTintColor: tokens.text2,
        }}
      >
        <TopTabs.Screen name="index" options={{ title: '📅 Calendar' }} />
        <TopTabs.Screen name="diary" options={{ title: '📔 Diary' }} />
        <TopTabs.Screen name="labs" options={{ title: '🧪 Labs' }} />
      </TopTabs>
    </SafeAreaView>
  );
}
