import { Tabs } from 'expo-router';
import BottomTabBar from '@/components/navigation/BottomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="records" />
      <Tabs.Screen name="scan" />
      <Tabs.Screen name="wellness" />
      <Tabs.Screen name="me" />
    </Tabs>
  );
}
