import { useMemo } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { CheckCircle, Circle, X } from 'lucide-react-native';
import { TS_DATA } from '@/constants/slots';
import { formatDose, fromStr, getMedsForDate, type Medicine } from '@/lib/schedule';
import { useTheme } from '@/lib/themeStore';

interface DayDetailsSheetProps {
  dateStr: string | null;
  meds: Medicine[];
  log: Record<string, boolean>;
  onClose: () => void;
}

export default function DayDetailsSheet({
  dateStr,
  meds,
  log,
  onClose,
}: DayDetailsSheetProps) {
  const { tokens } = useTheme();

  const dayMeds = useMemo(
    () => (dateStr ? getMedsForDate(meds, dateStr) : []),
    [meds, dateStr],
  );

  const dayLabel = useMemo(() => {
    if (!dateStr) return '';
    try {
      return fromStr(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }, [dateStr]);

  const slotsWithMeds = useMemo(
    () =>
      TS_DATA.filter((slot) =>
        dayMeds.some((m) => (m.dosesToday[slot.id] ?? 0) > 0),
      ),
    [dayMeds],
  );

  const visible = dateStr !== null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.55)',
          justifyContent: 'flex-end',
        }}
      >
        <Pressable
          // Swallow taps so they don't bubble to backdrop.
          onPress={() => {}}
          style={{
            backgroundColor: tokens.card,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            padding: 18,
            maxHeight: '75%',
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text
                style={{ fontSize: 17, fontWeight: '900', color: tokens.text }}
              >
                {dayLabel}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: tokens.text2,
                  fontWeight: '600',
                  marginTop: 2,
                }}
              >
                Day Details
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={{
                backgroundColor: tokens.card2,
                borderRadius: 50,
                padding: 8,
              }}
            >
              <X size={18} color={tokens.text} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {dayMeds.length === 0 ? (
              <View
                style={{
                  alignItems: 'center',
                  paddingVertical: 32,
                  paddingHorizontal: 16,
                }}
              >
                <Text style={{ fontSize: 42, marginBottom: 10 }}>🌿</Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: tokens.text2,
                    textAlign: 'center',
                  }}
                >
                  No medicines scheduled this day
                </Text>
              </View>
            ) : (
              slotsWithMeds.map((slot) => {
                const sm = dayMeds.filter(
                  (m) => (m.dosesToday[slot.id] ?? 0) > 0,
                );
                return (
                  <View key={slot.id} style={{ marginBottom: 14 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 7,
                      }}
                    >
                      <Text style={{ fontSize: 17 }}>{slot.emoji}</Text>
                      <Text
                        style={{
                          fontWeight: '800',
                          fontSize: 15,
                          color: tokens.text,
                        }}
                      >
                        {slot.label}
                      </Text>
                    </View>
                    {sm.map((med) => {
                      const taken = !!log[`${dateStr}_${med.id}_${slot.id}`];
                      return (
                        <View
                          key={`${med.id}-${slot.id}`}
                          style={{
                            backgroundColor: taken ? '#F0FDF4' : tokens.card2,
                            borderRadius: 11,
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            marginBottom: 6,
                            borderWidth: 2,
                            borderColor: taken ? '#86EFAC' : tokens.border,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 9,
                          }}
                        >
                          <View
                            style={{
                              width: 10,
                              height: 36,
                              borderRadius: 5,
                              backgroundColor: med.color ?? '#CBD5E1',
                            }}
                          />
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Text
                              style={{
                                fontWeight: '800',
                                fontSize: 14,
                                color: tokens.text,
                              }}
                            >
                              {med.drugName}
                            </Text>
                            <Text
                              style={{
                                fontSize: 12,
                                color: tokens.text2,
                                fontWeight: '600',
                              }}
                            >
                              {med.brandName} · {med.dose} ·{' '}
                              {formatDose(med.dosesToday[slot.id] ?? 0)}
                            </Text>
                          </View>
                          {taken ? (
                            <CheckCircle size={20} color="#16A34A" />
                          ) : (
                            <Circle size={20} color={tokens.text2} />
                          )}
                        </View>
                      );
                    })}
                  </View>
                );
              })
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
