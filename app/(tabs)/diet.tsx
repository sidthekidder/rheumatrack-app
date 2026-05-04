import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/themeStore';

export default function DietScreen() {
  const { tokens } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: tokens.text }}>Diet (T18)</Text>
      </View>
    </SafeAreaView>
  );
}
