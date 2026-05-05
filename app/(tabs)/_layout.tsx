import { Pressable, View, type GestureResponderEvent } from 'react-native';
import { Tabs } from 'expo-router';
import {
  BookOpen, Camera, FolderOpen, Home, LayoutDashboard, Settings, Utensils,
} from 'lucide-react-native';
import { useTheme } from '@/lib/themeStore';

interface CenterButtonProps {
  onPress?: (e: GestureResponderEvent) => void;
}

function CenterScanButton({ onPress }: CenterButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Scan prescription"
      onPress={onPress}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <View
        style={{
          // Raised — sits above the bar; matches v2 spec.
          marginTop: -16,
          width: 50,
          height: 50,
          borderRadius: 14,
          backgroundColor: '#0D9488',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#0D9488',
          shadowOpacity: 0.45,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 5,
        }}
      >
        <Camera size={22} color="white" strokeWidth={2.5} />
      </View>
    </Pressable>
  );
}

export default function TabLayout() {
  const { tokens } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0D9488',
        tabBarInactiveTintColor: tokens.text2,
        tabBarStyle: { backgroundColor: tokens.card, height: 64, paddingBottom: 6, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 9, fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="index" options={{
        title: 'Home',
        tabBarIcon: ({ color }) => <Home color={color} size={19} />,
      }} />
      <Tabs.Screen name="diary" options={{
        title: 'Diary',
        tabBarIcon: ({ color }) => <BookOpen color={color} size={19} />,
      }} />
      <Tabs.Screen name="records" options={{
        title: 'Records',
        tabBarIcon: ({ color }) => <FolderOpen color={color} size={19} />,
      }} />
      <Tabs.Screen name="scan" options={{
        title: 'Scan',
        tabBarIcon: () => null,
        tabBarLabel: () => null,
        tabBarButton: (props) => <CenterScanButton onPress={props.onPress as (e: GestureResponderEvent) => void} />,
      }} />
      <Tabs.Screen name="wellness" options={{
        title: 'Wellness',
        tabBarIcon: ({ color }) => <Utensils color={color} size={19} />,
      }} />
      <Tabs.Screen name="summary" options={{
        title: 'Summary',
        tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={19} />,
      }} />
      <Tabs.Screen name="settings" options={{
        title: 'Settings',
        tabBarIcon: ({ color }) => <Settings color={color} size={19} />,
      }} />
    </Tabs>
  );
}
