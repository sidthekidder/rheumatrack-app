import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Activity } from 'lucide-react-native';
import { useTheme } from '@/lib/themeStore';
import { greet } from '@/lib/schedule';

interface Props {
  patientName?: string;
  diagnosis?: string | null;
  totalDue: number;
  totalTaken: number;
  isLoading?: boolean;
}

export default function ProgressHeader({ patientName, diagnosis, totalDue, totalTaken, isLoading }: Props) {
  const { tokens } = useTheme();
  const pct = totalDue > 0 ? Math.round((totalTaken / totalDue) * 100) : 0;
  const firstName = patientName?.split(' ')[0];

  return (
    <LinearGradient
      colors={tokens.header.colors}
      start={tokens.header.start}
      end={tokens.header.end}
      style={{ paddingTop: 22, paddingBottom: 18, paddingHorizontal: 18 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <View style={{ flexShrink: 1 }}>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>
            {greet()}{firstName ? `, ${firstName}` : ''}!
          </Text>
          <Text style={{ fontSize: 22, fontWeight: '900', color: 'white', letterSpacing: -0.5 }}>
            💊 RheumaTrack
          </Text>
        </View>
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.18)',
            borderRadius: 14,
            paddingVertical: 7,
            paddingHorizontal: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: '900', color: 'white' }}>{isLoading ? '—' : `${pct}%`}</Text>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>Done</Text>
        </View>
      </View>

      <View style={{ marginTop: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', marginBottom: 5, color: 'rgba(255,255,255,0.9)' }}>
          {isLoading
            ? 'loading…'
            : pct === 100 && totalDue > 0
              ? '🎉 All medicines taken today!'
              : `${totalTaken} of ${totalDue} doses taken`}
        </Text>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 50, height: 8, overflow: 'hidden' }}>
          <View style={{ width: `${pct}%`, backgroundColor: 'white', height: '100%', borderRadius: 50 }} />
        </View>
      </View>

      {diagnosis ? (
        <View
          style={{
            marginTop: 11,
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: 10,
            paddingVertical: 7,
            paddingHorizontal: 11,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            alignSelf: 'flex-start',
          }}
        >
          <Activity size={14} color="white" />
          <Text style={{ fontSize: 13, fontWeight: '700', color: 'white' }}>{diagnosis}</Text>
        </View>
      ) : null}
    </LinearGradient>
  );
}
