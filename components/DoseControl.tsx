import { Pressable, Text, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { SLOTS, TS_DATA, type SlotId } from '@/constants/slots';
import type { DoseSchedule } from '@/lib/schedule';
import { formatDoseShort } from '@/lib/schedule';
import { useTheme } from '@/lib/themeStore';

interface Props {
  schedule: DoseSchedule;
  setter: (s: DoseSchedule) => void;
}

function clampHalfStep(n: number): number {
  return Math.max(0, Math.min(10, parseFloat(n.toFixed(1))));
}

export default function DoseControl({ schedule, setter }: Props) {
  const { tokens } = useTheme();

  const adjust = (slot: SlotId, delta: number) => {
    const cur = schedule[slot] ?? 0;
    const next = clampHalfStep(cur + delta);
    setter({ ...schedule, [slot]: next });
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 13,
        marginHorizontal: -4,
      }}
    >
      {TS_DATA.map((slot) => {
        const v = schedule[slot.id] ?? 0;
        const active = v > 0;
        return (
          <View
            key={slot.id}
            style={{
              width: '50%',
              paddingHorizontal: 4,
              marginBottom: 8,
            }}
          >
            <View
              style={{
                backgroundColor: active ? slot.bg : tokens.card2,
                borderWidth: 2,
                borderColor: active ? slot.border : tokens.border,
                borderRadius: 11,
                paddingVertical: 9,
                paddingHorizontal: 10,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  marginBottom: 6,
                }}
              >
                <Text style={{ fontSize: 16 }}>{slot.emoji}</Text>
                <Text
                  style={{
                    fontWeight: '800',
                    fontSize: 13,
                    color: active ? slot.text : tokens.text2,
                  }}
                >
                  {slot.label}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Decrease ${slot.label} dose`}
                  onPress={() => adjust(slot.id, -0.5)}
                  style={{
                    backgroundColor: tokens.card,
                    borderWidth: 1,
                    borderColor: slot.border,
                    borderRadius: 7,
                    padding: 5,
                  }}
                >
                  <Minus size={13} color={slot.accent} />
                </Pressable>
                <Text
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontWeight: '900',
                    fontSize: 18,
                    color: active ? slot.text : tokens.text2,
                  }}
                >
                  {v === 0 ? '—' : formatDoseShort(v)}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Increase ${slot.label} dose`}
                  onPress={() => adjust(slot.id, 0.5)}
                  style={{
                    backgroundColor: tokens.card,
                    borderWidth: 1,
                    borderColor: slot.border,
                    borderRadius: 7,
                    padding: 5,
                  }}
                >
                  <Plus size={13} color={slot.accent} />
                </Pressable>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// Re-export SLOTS for callers needing the slot list (avoid duplicate imports).
export { SLOTS };
