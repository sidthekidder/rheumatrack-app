import { Pressable, Text, View } from 'react-native';
import { CheckCircle, Circle } from 'lucide-react-native';
import type { SlotMeta } from '@/constants/slots';
import { useTheme } from '@/lib/themeStore';
import { formatDose, type MedWithDoses } from '@/lib/schedule';

interface Props {
  med: MedWithDoses;
  slot: SlotMeta;
  taken: boolean;
  onToggle: () => void;
}

export default function MedRow({ med, slot, taken, onToggle }: Props) {
  const { tokens } = useTheme();
  const qty = med.dosesToday[slot.id] ?? 0;
  const foodLabel = med.foodTimingLabel || 'Any Time';

  return (
    <View
      style={{
        backgroundColor: taken ? '#F0FDF4' : tokens.card,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 13,
        marginBottom: 7,
        borderWidth: 2,
        borderColor: taken ? '#86EFAC' : tokens.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
      }}
    >
      <View
        style={{
          width: 11,
          height: 42,
          borderRadius: 5,
          backgroundColor: med.color ?? '#0D9488',
        }}
      />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontWeight: '800',
            fontSize: 16,
            color: taken ? '#166534' : tokens.text,
            lineHeight: 19,
          }}
        >
          {med.drugName}
        </Text>
        <Text style={{ fontSize: 13, color: tokens.text2, fontWeight: '600', marginTop: 1 }}>
          {med.brandName} · {med.dose} ·{' '}
          <Text style={{ color: '#0D9488', fontWeight: '800' }}>{formatDose(qty)}</Text>
        </Text>
        <View style={{ flexDirection: 'row', marginTop: 3 }}>
          <Text
            style={{
              fontSize: 11,
              color: slot.text,
              backgroundColor: slot.bg,
              borderRadius: 6,
              paddingVertical: 2,
              paddingHorizontal: 7,
              fontWeight: '700',
              overflow: 'hidden',
            }}
          >
            🍽️ {foodLabel}
          </Text>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onToggle}
        style={{
          backgroundColor: taken ? '#16A34A' : tokens.card2,
          borderRadius: 50,
          paddingVertical: 8,
          paddingHorizontal: 13,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
        }}
      >
        {taken ? (
          <>
            <CheckCircle size={17} color="white" />
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>Taken</Text>
          </>
        ) : (
          <>
            <Circle size={17} color={tokens.text2} />
            <Text style={{ color: tokens.text2, fontWeight: '700', fontSize: 13 }}>Take</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}
