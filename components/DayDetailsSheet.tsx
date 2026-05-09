import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { CheckCircle, Circle, History, X } from 'lucide-react-native';
import { TS_DATA, type SlotId } from '@/constants/slots';
import { useT } from '@/lib/i18n/useT';
import { useMedicationLogHistory, useToggleTaken } from '@/lib/queries';
import {
  canEditLogForDate,
  filterHistoryForDate,
  formatDose,
  fromStr,
  getMedsForDate,
  today,
  type Medicine,
} from '@/lib/schedule';
import { useTheme } from '@/lib/themeStore';
import EditHistorySheet from '@/components/EditHistorySheet';

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
  const t = useT();
  const toggle = useToggleTaken();

  const canEdit = useMemo(() => canEditLogForDate(dateStr, today()), [dateStr]);
  const isFuture = !canEdit && dateStr !== null;
  const [historyOpen, setHistoryOpen] = useState(false);

  const fromTo = dateStr ?? '';
  const historyQ = useMedicationLogHistory(fromTo, fromTo, {
    enabled: Boolean(dateStr) && !isFuture,
  });
  const historyForDay = useMemo(
    () => filterHistoryForDate(historyQ.data ?? [], dateStr),
    [historyQ.data, dateStr],
  );

  const dayMeds = useMemo(
    () => (dateStr ? getMedsForDate(meds, dateStr) : []),
    [meds, dateStr],
  );

  const onToggle = (medicineId: string, slot: SlotId, currentlyTaken: boolean) => {
    if (!dateStr || !canEdit) return;
    toggle.mutate({ medicineId, logDate: dateStr, slot, taken: !currentlyTaken });
  };

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
      <View style={{ flex: 1 }}>
        {/* Backdrop — absolute sibling so taps on the sheet body don't bubble here on web. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
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
                {t('day_details')}
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
                  {t('no_meds_scheduled')}
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
                      const rowStyle = {
                        backgroundColor: taken ? '#F0FDF4' : tokens.card2,
                        borderRadius: 11,
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        marginBottom: 6,
                        borderWidth: 2,
                        borderColor: taken ? '#86EFAC' : tokens.border,
                        flexDirection: 'row' as const,
                        alignItems: 'center' as const,
                        gap: 9,
                        opacity: isFuture ? 0.55 : 1,
                      };
                      const rowContent = (
                        <>
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
                        </>
                      );
                      if (isFuture) {
                        return (
                          <View key={`${med.id}-${slot.id}`} style={rowStyle}>
                            {rowContent}
                          </View>
                        );
                      }
                      return (
                        <Pressable
                          key={`${med.id}-${slot.id}`}
                          accessibilityRole="button"
                          accessibilityState={{ checked: taken }}
                          accessibilityLabel={`${med.drugName} ${slot.label}`}
                          onPress={() => onToggle(med.id, slot.id, taken)}
                          style={({ pressed }) => ({
                            ...rowStyle,
                            opacity: pressed ? 0.7 : rowStyle.opacity,
                          })}
                        >
                          {rowContent}
                        </Pressable>
                      );
                    })}
                  </View>
                );
              })
            )}

            {historyForDay.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('view_edit_history')}
                onPress={() => setHistoryOpen(true)}
                style={({ pressed }) => ({
                  marginTop: 6,
                  paddingVertical: 11,
                  paddingHorizontal: 14,
                  borderRadius: 11,
                  borderWidth: 1.5,
                  borderColor: tokens.border,
                  backgroundColor: tokens.card2,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <History size={15} color={tokens.text} />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: tokens.text,
                  }}
                >
                  {historyForDay.length === 1
                    ? t('view_edit_history')
                    : t('view_edit_history_n', { n: historyForDay.length })}
                </Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>
      </View>
      <EditHistorySheet
        dateStr={historyOpen ? dateStr : null}
        meds={meds}
        onClose={() => setHistoryOpen(false)}
      />
    </Modal>
  );
}
