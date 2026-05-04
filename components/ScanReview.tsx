import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Check,
  Sparkles,
  Stethoscope,
} from 'lucide-react-native';
import { DOW_LONG, DOW_SHORT } from '@/constants/dow';
import { FOOD_LABELS, FOOD_TID, type FoodTimingId } from '@/constants/food';
import { SLOTS, TS_DATA, type SlotId } from '@/constants/slots';
import type {
  DoseSchedule,
  MedicineCreate,
  ParsedMedicine,
  ParsedPrescription,
  ScheduleType,
} from '@/lib/api';
import { formatDose, formatDoseShort } from '@/lib/schedule';
import { useTheme } from '@/lib/themeStore';

interface ScanReviewProps {
  extracted: ParsedPrescription;
  selected: ReadonlySet<number>;
  onToggle: (index: number) => void;
  onSelectAll: () => void;
  onUnselectAll: () => void;
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
}

function getMeds(extracted: ParsedPrescription): ParsedMedicine[] {
  return extracted.medications ?? extracted.medicines ?? [];
}

function getFoodTimingId(m: ParsedMedicine): FoodTimingId | null {
  const raw = m.foodTimingId ?? m.foodTiming;
  if (!raw) return null;
  const idx = (FOOD_TID as readonly string[]).indexOf(raw);
  return idx >= 0 ? (FOOD_TID[idx] as FoodTimingId) : null;
}

function foodLabelFor(m: ParsedMedicine): string {
  const id = getFoodTimingId(m);
  if (!id) return 'Any Time';
  const i = FOOD_TID.indexOf(id);
  return i >= 0 ? FOOD_LABELS[i] : 'Any Time';
}

function slotsTxtFor(schedule: DoseSchedule | undefined, short: boolean): string {
  if (!schedule) return '';
  return SLOTS.filter((s) => (schedule[s] ?? 0) > 0)
    .map((s) => {
      const qty = schedule[s] ?? 0;
      const label = TS_DATA.find((x) => x.id === s)?.label ?? s;
      const num = short ? formatDoseShort(qty) : formatDose(qty);
      return `${num} ${label}`;
    })
    .join(' + ');
}

function describeSchedule(m: ParsedMedicine): string {
  const slotsTxt = slotsTxtFor(m.doseSchedule, true);
  const type = (m.scheduleType ?? 'daily') as ScheduleType;
  if (type === 'weekly' && typeof m.weekDay === 'number') {
    return `Every ${DOW_LONG[m.weekDay] ?? ''} • ${slotsTxt}`;
  }
  if (type === 'alternate') {
    return `Alternate days • ${slotsTxt}`;
  }
  if (type === 'tapering') {
    return `Tapering schedule (${m.taperingPhases?.length ?? 0} phases)`;
  }
  if (m.excludeDays && m.excludeDays.length > 0) {
    const days = m.excludeDays
      .map((d) => DOW_SHORT[d] ?? '')
      .filter(Boolean)
      .join(', ');
    return `Daily except ${days} • ${slotsTxt}`;
  }
  return `Daily • ${slotsTxt}`;
}

export default function ScanReview({
  extracted,
  selected,
  onToggle,
  onSelectAll,
  onUnselectAll,
  onBack,
  onSave,
  isSaving,
}: ScanReviewProps) {
  const { tokens } = useTheme();
  const meds = getMeds(extracted);
  const total = meds.length;
  const allSelected = total > 0 && selected.size === total;

  const saveDisabled = isSaving || selected.size === 0;

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={onBack}
        style={{
          backgroundColor: tokens.card,
          borderWidth: 2,
          borderColor: tokens.border,
          borderRadius: 11,
          paddingVertical: 7,
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          marginBottom: 11,
          alignSelf: 'flex-start',
        }}
      >
        <ArrowLeft size={15} color={tokens.text} />
        <Text style={{ fontSize: 13, fontWeight: '700', color: tokens.text }}>
          Back
        </Text>
      </Pressable>

      <LinearGradient
        colors={['#10B981', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 14, padding: 13, marginBottom: 11 }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 5,
          }}
        >
          <Sparkles size={18} color="white" />
          <Text style={{ fontWeight: '800', fontSize: 16, color: 'white' }}>
            Extracted from Prescription
          </Text>
        </View>
        <Text style={{ fontSize: 13, color: 'white', opacity: 0.9 }}>
          Review the details — uncheck any you don't want to add
        </Text>
      </LinearGradient>

      {extracted.diagnosis || extracted.doctorName || extracted.prescriptionDate ? (
        <View
          style={{
            backgroundColor: tokens.card,
            borderRadius: 13,
            padding: 13,
            marginBottom: 11,
            borderWidth: 2,
            borderColor: tokens.border,
          }}
        >
          {extracted.diagnosis ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 7,
                marginBottom: 6,
              }}
            >
              <Activity size={15} color="#0D9488" />
              <Text
                style={{ fontSize: 12, fontWeight: '700', color: tokens.text2 }}
              >
                Diagnosis:
              </Text>
              <Text
                style={{ fontSize: 13, fontWeight: '800', color: tokens.text }}
              >
                {extracted.diagnosis}
              </Text>
            </View>
          ) : null}
          {extracted.doctorName ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 7,
                marginBottom: 6,
              }}
            >
              <Stethoscope size={15} color="#0D9488" />
              <Text
                style={{ fontSize: 13, fontWeight: '600', color: tokens.text2 }}
              >
                {extracted.doctorName}
              </Text>
            </View>
          ) : null}
          {extracted.prescriptionDate ? (
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}
            >
              <CalendarDays size={15} color="#0D9488" />
              <Text
                style={{ fontSize: 13, fontWeight: '600', color: tokens.text2 }}
              >
                {extracted.prescriptionDate}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <Text style={{ fontWeight: '800', fontSize: 14, color: tokens.text }}>
          {selected.size} / {total} selected
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={allSelected ? onUnselectAll : onSelectAll}
          style={{
            backgroundColor: tokens.card2,
            borderRadius: 9,
            paddingVertical: 6,
            paddingHorizontal: 11,
          }}
        >
          <Text style={{ fontWeight: '700', fontSize: 13, color: '#0D9488' }}>
            {allSelected ? 'Unselect All' : 'Select All'}
          </Text>
        </Pressable>
      </View>

      {meds.map((m, i) => {
        const sel = selected.has(i);
        const foodTxt = foodLabelFor(m);
        return (
          <Pressable
            key={`${m.drugName}-${i}`}
            accessibilityRole="button"
            accessibilityState={{ selected: sel }}
            onPress={() => onToggle(i)}
            style={{
              backgroundColor: sel ? tokens.card : tokens.card2,
              borderRadius: 13,
              padding: 13,
              marginBottom: 9,
              borderWidth: 2,
              borderColor: sel ? '#0D9488' : tokens.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 9 }}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 50,
                  backgroundColor: sel ? '#0D9488' : tokens.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 1,
                }}
              >
                {sel ? <Check size={14} color="white" /> : null}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'baseline',
                    flexWrap: 'wrap',
                  }}
                >
                  <Text
                    style={{
                      fontWeight: '800',
                      fontSize: 16,
                      color: tokens.text,
                      marginRight: 7,
                    }}
                  >
                    {m.drugName}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: tokens.text2,
                      fontWeight: '600',
                    }}
                  >
                    {[m.brandName, m.dose].filter(Boolean).join(' ')}
                  </Text>
                </View>
                <View
                  style={{
                    alignSelf: 'flex-start',
                    marginTop: 3,
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    backgroundColor: '#F0FDFA',
                    borderRadius: 7,
                  }}
                >
                  <Text
                    style={{ fontSize: 13, color: '#0D9488', fontWeight: '700' }}
                  >
                    {describeSchedule(m)}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    color: tokens.text2,
                    fontWeight: '600',
                    marginTop: 5,
                  }}
                >
                  🍽️ {foodTxt}
                </Text>
                {typeof m.durationDays === 'number' && m.durationDays > 0 ? (
                  <Text
                    style={{
                      fontSize: 12,
                      color: tokens.text2,
                      fontWeight: '600',
                      marginTop: 2,
                    }}
                  >
                    ⏱️ {m.durationDays} days
                  </Text>
                ) : null}
                {m.scheduleType === 'tapering' && m.taperingPhases ? (
                  <View
                    style={{
                      marginTop: 7,
                      backgroundColor: '#FEF3C7',
                      borderRadius: 8,
                      paddingVertical: 7,
                      paddingHorizontal: 9,
                      borderWidth: 1,
                      borderColor: '#FCD34D',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '800',
                        color: '#92400E',
                        marginBottom: 3,
                      }}
                    >
                      TAPERING PHASES
                    </Text>
                    {m.taperingPhases.map((p, j) => {
                      const phases = m.taperingPhases ?? [];
                      const startDay =
                        j === 0
                          ? 1
                          : phases.slice(0, j).reduce((s, x) => s + x.days, 0) + 1;
                      const endDay = phases
                        .slice(0, j + 1)
                        .reduce((s, x) => s + x.days, 0);
                      const phaseSlots = (SLOTS as readonly SlotId[])
                        .filter((s) => (p.doseSchedule[s] ?? 0) > 0)
                        .map((s) => {
                          const qty = p.doseSchedule[s] ?? 0;
                          const label =
                            TS_DATA.find((x) => x.id === s)?.label ?? s;
                          return `${formatDose(qty)} ${label}`;
                        })
                        .join(' + ');
                      return (
                        <Text
                          key={j}
                          style={{
                            fontSize: 12,
                            color: '#78350F',
                            fontWeight: '600',
                            marginBottom: 1,
                          }}
                        >
                          Day {startDay}–{endDay}: {phaseSlots}
                        </Text>
                      );
                    })}
                  </View>
                ) : null}
                {m.remarks ? (
                  <Text
                    style={{
                      fontSize: 11,
                      color: tokens.text2,
                      fontStyle: 'italic',
                      marginTop: 5,
                      fontWeight: '500',
                    }}
                  >
                    "{m.remarks}"
                  </Text>
                ) : null}
              </View>
            </View>
          </Pressable>
        );
      })}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: saveDisabled }}
        onPress={saveDisabled ? undefined : onSave}
        disabled={saveDisabled}
        style={{ marginTop: 6 }}
      >
        {saveDisabled && !isSaving ? (
          <View
            style={{
              backgroundColor: '#CBD5E1',
              borderRadius: 14,
              padding: 14,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 7,
            }}
          >
            <Text
              style={{ color: 'white', fontWeight: '900', fontSize: 18 }}
            >
              ✅ Save All Medicines ({selected.size})
            </Text>
          </View>
        ) : (
          <LinearGradient
            colors={isSaving ? ['#94A3B8', '#64748B'] : ['#0D9488', '#0284C7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 14,
              padding: 14,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 7,
            }}
          >
            {isSaving ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text
                  style={{ color: 'white', fontWeight: '900', fontSize: 18 }}
                >
                  Adding medicines...
                </Text>
              </>
            ) : (
              <Text
                style={{ color: 'white', fontWeight: '900', fontSize: 18 }}
              >
                ✅ Save All Medicines ({selected.size})
              </Text>
            )}
          </LinearGradient>
        )}
      </Pressable>
    </View>
  );
}

// Re-export pure helpers so `scan.tsx` can build MedicineCreate rows.
export function buildMedicineCreate(
  m: ParsedMedicine,
  startDate: string,
  color: string
): MedicineCreate {
  const ftRaw = m.foodTimingId ?? m.foodTiming ?? 'any_time';
  const ftIdx = (FOOD_TID as readonly string[]).indexOf(ftRaw);
  const ftLabel = ftIdx >= 0 ? FOOD_LABELS[ftIdx] : 'Any Time';
  return {
    drugName: m.drugName,
    brandName: m.brandName ?? m.drugName,
    dose: m.dose ?? 'As prescribed',
    scheduleType: (m.scheduleType ?? 'daily') as ScheduleType,
    doseSchedule:
      m.doseSchedule ?? { morning: 1, afternoon: 0, evening: 0, night: 0 },
    weekDay: m.weekDay ?? null,
    excludeDays: m.excludeDays ?? [],
    taperingPhases: m.taperingPhases ?? null,
    startDate,
    durationDays: m.durationDays ?? 30,
    foodTimingId: ftRaw,
    foodTimingLabel: ftLabel,
    notes: m.remarks ?? '',
    route: 'Oral',
    color,
  };
}
