import { Pressable, Text, TextInput, View } from 'react-native';
import type { DoseSchedule, TaperingPhase } from '@/lib/schedule';
import { useTheme } from '@/lib/themeStore';
import DoseControl from './DoseControl';

interface Props {
  phases: TaperingPhase[];
  setPhases: (p: TaperingPhase[]) => void;
}

const EMPTY_DOSES: DoseSchedule = {
  morning: 0,
  afternoon: 0,
  evening: 0,
  night: 0,
};

export default function TaperingBuilder({ phases, setPhases }: Props) {
  const { tokens } = useTheme();

  const updatePhase = (i: number, patch: Partial<TaperingPhase>) => {
    const next = phases.slice();
    next[i] = { ...next[i], ...patch };
    setPhases(next);
  };

  const setPhaseDoses = (i: number, ds: DoseSchedule) => {
    updatePhase(i, { doseSchedule: ds });
  };

  const setPhaseDays = (i: number, raw: string) => {
    const parsed = parseInt(raw, 10);
    const days = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    updatePhase(i, { days });
  };

  const addPhase = () =>
    setPhases([...phases, { days: 7, doseSchedule: { ...EMPTY_DOSES } }]);

  const removePhase = (i: number) =>
    setPhases(phases.filter((_, j) => j !== i));

  return (
    <View>
      {phases.map((phase, i) => (
        <View
          key={i}
          style={{
            backgroundColor: tokens.card,
            borderWidth: 2,
            borderColor: tokens.border,
            borderRadius: 13,
            padding: 11,
            marginBottom: 9,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <Text
              style={{ fontWeight: '800', fontSize: 14, color: tokens.text }}
            >
              Phase {i + 1}
            </Text>
            {phases.length > 1 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove phase ${i + 1}`}
                onPress={() => removePhase(i)}
                style={{
                  backgroundColor: '#FEE2E2',
                  borderRadius: 7,
                  paddingVertical: 4,
                  paddingHorizontal: 9,
                }}
              >
                <Text
                  style={{ fontWeight: '700', fontSize: 12, color: '#DC2626' }}
                >
                  Remove
                </Text>
              </Pressable>
            ) : null}
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 9,
            }}
          >
            <Text
              style={{ fontSize: 13, fontWeight: '700', color: tokens.text2 }}
            >
              Duration:
            </Text>
            <TextInput
              value={String(phase.days)}
              onChangeText={(v) => setPhaseDays(i, v)}
              keyboardType="numeric"
              style={{
                width: 70,
                borderWidth: 2,
                borderColor: tokens.border,
                borderRadius: 8,
                paddingVertical: 6,
                paddingHorizontal: 9,
                fontSize: 14,
                fontWeight: '700',
                backgroundColor: tokens.input,
                color: tokens.text,
                textAlign: 'center',
              }}
            />
            <Text
              style={{ fontSize: 13, fontWeight: '700', color: tokens.text2 }}
            >
              days
            </Text>
          </View>
          <DoseControl
            schedule={phase.doseSchedule}
            setter={(s) => setPhaseDoses(i, s)}
          />
        </View>
      ))}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add phase"
        onPress={addPhase}
        style={{
          backgroundColor: tokens.card,
          borderWidth: 2,
          borderColor: '#0D9488',
          borderStyle: 'dashed',
          borderRadius: 11,
          paddingVertical: 9,
          alignItems: 'center',
          marginBottom: 13,
        }}
      >
        <Text style={{ color: '#0D9488', fontWeight: '800', fontSize: 14 }}>
          + Add Phase
        </Text>
      </Pressable>
    </View>
  );
}
