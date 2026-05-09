import { useMemo } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { CheckCircle, Circle, Clock, X } from 'lucide-react-native';
import { TS_DATA } from '@/constants/slots';
import { useT } from '@/lib/i18n/useT';
import { useMedicationLogHistory } from '@/lib/queries';
import { filterHistoryForDate, fromStr, type Medicine } from '@/lib/schedule';
import { useTheme } from '@/lib/themeStore';

interface EditHistorySheetProps {
  dateStr: string | null;
  meds: Medicine[];
  onClose: () => void;
}

export default function EditHistorySheet({
  dateStr,
  meds,
  onClose,
}: EditHistorySheetProps) {
  const { tokens } = useTheme();
  const t = useT();

  const fromTo = dateStr ?? '';
  const historyQ = useMedicationLogHistory(fromTo, fromTo, {
    enabled: Boolean(dateStr),
  });

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

  const entries = useMemo(
    () => filterHistoryForDate(historyQ.data ?? [], dateStr),
    [historyQ.data, dateStr],
  );

  const medById = useMemo(() => {
    const out = new Map<string, Medicine>();
    for (const m of meds) out.set(m.id, m);
    return out;
  }, [meds]);

  const slotById = useMemo(() => {
    const out: Record<string, (typeof TS_DATA)[number]> = {};
    for (const s of TS_DATA) out[s.id] = s;
    return out;
  }, []);

  const visible = dateStr !== null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('close')}
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.55)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            maxHeight: '75%',
            backgroundColor: tokens.card,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            padding: 18,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ fontSize: 17, fontWeight: '900', color: tokens.text }}>
                {t('edit_history')}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: tokens.text2,
                  fontWeight: '600',
                  marginTop: 2,
                }}
              >
                {dayLabel}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('close')}
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
            {historyQ.isLoading ? (
              <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                <ActivityIndicator color={tokens.text2} />
              </View>
            ) : entries.length === 0 ? (
              <View
                style={{
                  alignItems: 'center',
                  paddingVertical: 32,
                  paddingHorizontal: 16,
                }}
              >
                <Text style={{ fontSize: 42, marginBottom: 10 }}>📝</Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: tokens.text2,
                    textAlign: 'center',
                  }}
                >
                  {t('no_edit_history')}
                </Text>
              </View>
            ) : (
              entries.map((entry) => {
                const med = medById.get(entry.medicineId);
                const slot = slotById[entry.slot];
                const editedAt = new Date(entry.editedAt);
                const editedLabel = editedAt.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                });
                const editedDateStr = `${editedAt.getFullYear()}-${String(editedAt.getMonth() + 1).padStart(2, '0')}-${String(editedAt.getDate()).padStart(2, '0')}`;
                const daysLate =
                  editedDateStr > entry.logDate
                    ? Math.floor(
                        (Date.parse(editedDateStr) - Date.parse(entry.logDate)) /
                          86400000,
                      )
                    : 0;

                const fromState =
                  entry.priorTaken === null
                    ? t('history_state_none')
                    : entry.priorTaken
                      ? t('history_state_taken')
                      : t('history_state_not_taken');
                const toState = entry.newTaken
                  ? t('history_state_taken')
                  : t('history_state_not_taken');

                return (
                  <View
                    key={entry.id}
                    style={{
                      backgroundColor: tokens.card2,
                      borderRadius: 11,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: tokens.border,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 4,
                      }}
                    >
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: med?.color ?? '#CBD5E1',
                        }}
                      />
                      <Text
                        style={{
                          fontWeight: '800',
                          fontSize: 14,
                          color: tokens.text,
                          flex: 1,
                        }}
                        numberOfLines={1}
                      >
                        {med?.drugName ?? t('unknown_medicine')}
                      </Text>
                      {slot ? (
                        <Text
                          style={{
                            fontSize: 12,
                            color: tokens.text2,
                            fontWeight: '700',
                          }}
                        >
                          {slot.emoji} {slot.label}
                        </Text>
                      ) : null}
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: tokens.text2,
                          fontWeight: '600',
                        }}
                      >
                        {fromState}
                      </Text>
                      <Text style={{ color: tokens.text2 }}>→</Text>
                      {entry.newTaken ? (
                        <CheckCircle size={14} color="#16A34A" />
                      ) : (
                        <Circle size={14} color={tokens.text2} />
                      )}
                      <Text
                        style={{
                          fontSize: 13,
                          color: tokens.text,
                          fontWeight: '700',
                        }}
                      >
                        {toState}
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                        marginTop: 6,
                      }}
                    >
                      <Clock size={11} color={tokens.text2} />
                      <Text
                        style={{
                          fontSize: 11,
                          color: tokens.text2,
                          fontWeight: '600',
                        }}
                      >
                        {editedLabel}
                      </Text>
                      {daysLate > 0 ? (
                        <Text
                          style={{
                            fontSize: 11,
                            color: '#B45309',
                            fontWeight: '800',
                            marginLeft: 4,
                          }}
                        >
                          ·{' '}
                          {daysLate === 1
                            ? t('edited_1_day_late')
                            : t('edited_n_days_late', { n: daysLate })}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
