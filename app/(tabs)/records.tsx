import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { FolderOpen } from 'lucide-react-native';
import CalendarView from '@/components/CalendarView';
import LabsView from '@/components/LabsView';
import { useTheme } from '@/lib/themeStore';

type Sub = 'cal' | 'labs';

const SUBS: ReadonlyArray<{ id: Sub; em: string; lb: string }> = [
  { id: 'cal', em: '📅', lb: 'Calendar' },
  { id: 'labs', em: '🧪', lb: 'Lab Tracker' },
];

export default function RecordsScreen() {
  const { tokens } = useTheme();
  const [sub, setSub] = useState<Sub>('cal');

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: tokens.bg }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={tokens.header.colors}
        start={tokens.header.start}
        end={tokens.header.end}
        style={{ paddingTop: 22, paddingHorizontal: 18, paddingBottom: 16 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 11 }}>
          <FolderOpen size={22} color="white" />
          <Text style={{ fontSize: 22, fontWeight: '900', color: 'white' }}>Records</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 7 }}>
          {SUBS.map((s) => {
            const active = sub === s.id;
            return (
              <Pressable
                key={s.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setSub(s.id)}
                style={{
                  flex: 1, paddingVertical: 9,
                  borderRadius: 10,
                  backgroundColor: active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}>
                <Text style={{ fontSize: 14 }}>{s.em}</Text>
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>{s.lb}</Text>
              </Pressable>
            );
          })}
        </View>
      </LinearGradient>

      <View style={{ flex: 1 }}>
        {sub === 'cal' ? <CalendarView /> : null}
        {sub === 'labs' ? <LabsView /> : null}
      </View>
    </SafeAreaView>
  );
}
