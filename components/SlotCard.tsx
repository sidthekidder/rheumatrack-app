import { Text, View } from 'react-native';
import type { SlotId, SlotMeta } from '@/constants/slots';
import { useTheme } from '@/lib/themeStore';
import type { MedWithDoses } from '@/lib/schedule';
import MedRow from './MedRow';

interface Props {
  slot: SlotMeta;
  meds: MedWithDoses[];
  isTaken: (medId: string, slot: SlotId) => boolean;
  onToggle: (medId: string, slot: SlotId) => void;
}

export default function SlotCard({ slot, meds, isTaken, onToggle }: Props) {
  const { tokens } = useTheme();

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 7 }}>
        <View
          style={{
            backgroundColor: slot.bg,
            borderWidth: 2,
            borderColor: slot.border,
            borderRadius: 11,
            paddingVertical: 3,
            paddingHorizontal: 11,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <Text style={{ fontSize: 17 }}>{slot.emoji}</Text>
          <Text style={{ fontWeight: '800', fontSize: 15, color: slot.text }}>{slot.label}</Text>
        </View>
        <Text style={{ color: tokens.text2, fontSize: 13, fontWeight: '600' }}>{slot.time}</Text>
      </View>
      {meds.map((med) => (
        <MedRow
          key={`${med.id}-${slot.id}`}
          med={med}
          slot={slot}
          taken={isTaken(med.id, slot.id)}
          onToggle={() => onToggle(med.id, slot.id)}
        />
      ))}
    </View>
  );
}
