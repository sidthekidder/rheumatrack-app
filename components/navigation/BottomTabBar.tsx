import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home as HomeIcon,
  FolderOpen,
  Sparkles,
  User,
} from 'lucide-react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/lib/themeStore';
import AddButton from './AddButton';

const TAB_ORDER = ['index', 'records', 'scan', 'wellness', 'me'] as const;

const ICONS: Record<string, React.ComponentType<{ color: string; size: number }>> = {
  index: HomeIcon,
  records: FolderOpen,
  wellness: Sparkles,
  me: User,
};

const LABELS: Record<string, string> = {
  index: 'Home',
  records: 'Records',
  wellness: 'Wellness',
  me: 'Me',
};

const ACTIVE_PILL = '#E6F7F5';
const ACTIVE_TINT = '#0D9488';

export default function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();

  // Order routes per TAB_ORDER (defensive against expo-router re-ordering)
  const orderedRoutes = TAB_ORDER
    .map((name) => state.routes.find((r) => r.name === name))
    .filter((r): r is typeof state.routes[number] => !!r);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: tokens.card,
        borderTopWidth: 1,
        borderTopColor: tokens.border,
        paddingTop: 6,
        paddingBottom: Math.max(insets.bottom, 6),
        height: 64 + Math.max(insets.bottom, 0),
      }}
    >
      {orderedRoutes.map((route) => {
        const isFocused = state.routes[state.index].key === route.key;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (route.name === 'scan') {
          return (
            <View key={route.key} style={{ flex: 1, alignItems: 'center' }}>
              <AddButton onPress={onPress} active={isFocused} />
            </View>
          );
        }

        const Icon = ICONS[route.name];
        const label = LABELS[route.name];
        const tintColor = isFocused ? ACTIVE_TINT : tokens.text2;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isFocused ? ACTIVE_PILL : 'transparent',
              }}
            >
              <Icon color={tintColor} size={20} />
            </View>
            <Text style={{ fontSize: 9, fontWeight: '700', color: tintColor, marginTop: 2 }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
