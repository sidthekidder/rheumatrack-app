import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Info,
  Pill,
  Search,
  X,
} from 'lucide-react-native';
import ProgressDots from '@/components/ProgressDots';
import DoseControl from '@/components/DoseControl';
import TaperingBuilder from '@/components/TaperingBuilder';
import { CATEGORIES, DRUGS, type Drug } from '@/constants/drugs';
import { DOW_SHORT } from '@/constants/dow';
import { FOOD_ICONS, FOOD_LABELS, FOOD_TID } from '@/constants/food';
import { MED_COLORS } from '@/constants/medColors';
import { SLOTS } from '@/constants/slots';
import type {
  DoseSchedule,
  MedicineCreate,
  ScheduleType,
  TaperingPhase,
} from '@/lib/api';
import { today } from '@/lib/schedule';
import { useCreateMedicine, useMedicines } from '@/lib/queries';
import { useTheme } from '@/lib/themeStore';

const SCHEDULE_OPTIONS: ReadonlyArray<{
  id: ScheduleType;
  label: string;
  emoji: string;
}> = [
  { id: 'daily', label: 'Every Day', emoji: '📅' },
  { id: 'weekly', label: 'Specific Day', emoji: '📆' },
  { id: 'alternate', label: 'Alternate Days', emoji: '🔄' },
  { id: 'tapering', label: 'Tapering', emoji: '📉' },
];

const EMPTY_DOSES: DoseSchedule = {
  morning: 0,
  afternoon: 0,
  evening: 0,
  night: 0,
};

export default function AddMedicineScreen() {
  const router = useRouter();
  const { tokens } = useTheme();

  const medsQ = useMedicines();
  const createMutation = useCreateMedicine();

  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState('');
  const [selCat, setSelCat] = useState<string>('All');
  const [selDrug, setSelDrug] = useState<Drug | null>(null);
  const [customDrug, setCustomDrug] = useState('');
  const [brand, setBrand] = useState('');
  const [dose, setDose] = useState('');
  const [customDose, setCustomDose] = useState('');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('daily');
  const [doseSchedule, setDoseSchedule] = useState<DoseSchedule>({
    ...EMPTY_DOSES,
  });
  const [weekDay, setWeekDay] = useState<number>(1);
  const [excludeDays, setExcludeDays] = useState<number[]>([]);
  const [taperingPhases, setTaperingPhases] = useState<TaperingPhase[]>([
    { days: 7, doseSchedule: { ...EMPTY_DOSES } },
  ]);
  const [foodTiming, setFoodTiming] = useState<string>('');
  const [reminderTime, setReminderTime] = useState('');
  const [durationDays, setDurationDays] = useState<number>(30);
  const [startDate, setStartDate] = useState<string>(today());
  const [notes, setNotes] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return DRUGS.filter(
      (d) =>
        (selCat === 'All' || d.cat === selCat) &&
        (d.name.toLowerCase().includes(q) ||
          d.brands.some((b) => b.toLowerCase().includes(q)))
    );
  }, [search, selCat]);

  const handleHeaderBack = () => {
    if (step === 2) {
      setStep(1);
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace('/medicines' as Href);
  };

  const selectDrug = (drug: Drug) => {
    setSelDrug(drug);
    setBrand(drug.brands[0] ?? '');
    setDose(drug.doses[0] ?? '');
    setCustomDose('');
    setStep(2);
  };

  const continueWithCustom = () => {
    if (!customDrug.trim()) return;
    setSelDrug(null);
    setBrand(customDrug);
    setDose('');
    setCustomDose('');
    setStep(2);
  };

  const toggleExcludeDay = (d: number) =>
    setExcludeDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const finalDose = dose === 'custom' ? customDose : dose;
  const finalDrug = selDrug ? selDrug.name : customDrug;

  const canSave = (): boolean => {
    if (!finalDrug || !brand || !finalDose || !foodTiming) return false;
    if (scheduleType === 'tapering') {
      return (
        taperingPhases.length > 0 &&
        taperingPhases.every((p) =>
          SLOTS.some((s) => (p.doseSchedule[s] ?? 0) > 0)
        )
      );
    }
    return SLOTS.some((s) => (doseSchedule[s] ?? 0) > 0);
  };

  const handleSave = async () => {
    if (!canSave()) return;
    const ftIdx = FOOD_TID.indexOf(foodTiming as (typeof FOOD_TID)[number]);
    const ftLabel = ftIdx >= 0 ? FOOD_LABELS[ftIdx] : 'Any Time';
    const totalDuration =
      scheduleType === 'tapering'
        ? taperingPhases.reduce((s, p) => s + p.days, 0)
        : durationDays;
    const existingCount = medsQ.data?.length ?? 0;
    const newMed: MedicineCreate = {
      drugName: finalDrug,
      brandName: brand,
      dose: finalDose,
      scheduleType,
      doseSchedule:
        scheduleType === 'tapering'
          ? taperingPhases[0].doseSchedule
          : doseSchedule,
      weekDay: scheduleType === 'weekly' ? weekDay : null,
      excludeDays: scheduleType === 'daily' ? excludeDays : [],
      taperingPhases: scheduleType === 'tapering' ? taperingPhases : null,
      startDate,
      durationDays: totalDuration,
      foodTimingId: foodTiming,
      foodTimingLabel: ftLabel,
      reminderTime: reminderTime || undefined,
      notes: notes || undefined,
      route: selDrug?.route ?? 'Oral',
      tip: selDrug?.tip ?? undefined,
      color: MED_COLORS[existingCount % MED_COLORS.length],
    };
    try {
      await createMutation.mutateAsync(newMed);
      if (router.canGoBack()) router.back();
      else router.replace('/medicines' as Href);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to save medicine';
      Alert.alert('Could not save', msg);
    }
  };

  // ---- Shared style helpers ----------------------------------------------

  const inp = {
    width: '100%' as const,
    borderWidth: 2,
    borderColor: tokens.border,
    borderRadius: 11,
    paddingVertical: 11,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 13,
    backgroundColor: tokens.input,
    color: tokens.text,
  };

  const Lbl = ({ children }: { children: React.ReactNode }) => (
    <Text
      style={{
        fontSize: 12,
        fontWeight: '700',
        color: tokens.text2,
        marginBottom: 6,
      }}
    >
      {children}
    </Text>
  );

  const Chip = ({
    label,
    selected,
    onPress,
  }: {
    label: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        backgroundColor: selected ? '#0D9488' : tokens.card,
        borderWidth: 2,
        borderColor: selected ? '#0D9488' : tokens.border,
        borderRadius: 50,
        paddingVertical: 5,
        paddingHorizontal: 11,
      }}
    >
      <Text
        style={{
          color: selected ? 'white' : tokens.text2,
          fontWeight: '700',
          fontSize: 12,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );

  // ---- Step 1: drug picker ------------------------------------------------

  const renderStep1 = () => (
    <View>
      <View
        style={{
          backgroundColor: tokens.card,
          borderRadius: 12,
          paddingVertical: 9,
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
          marginBottom: 11,
          borderWidth: 2,
          borderColor: tokens.border,
        }}
      >
        <Search size={17} color={tokens.text2} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search medicine or brand..."
          placeholderTextColor={tokens.text2}
          style={{
            flex: 1,
            fontSize: 15,
            color: tokens.text,
            fontWeight: '600',
            paddingVertical: 0,
          }}
        />
        {search ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => setSearch('')}
          >
            <X size={15} color={tokens.text2} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, paddingBottom: 6 }}
        style={{ marginBottom: 11 }}
      >
        {CATEGORIES.map((c) => {
          const active = selCat === c;
          return (
            <Pressable
              key={c}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setSelCat(c)}
              style={{
                backgroundColor: active ? '#0D9488' : tokens.card,
                borderWidth: 2,
                borderColor: active ? '#0D9488' : tokens.border,
                borderRadius: 50,
                paddingVertical: 5,
                paddingHorizontal: 11,
              }}
            >
              <Text
                style={{
                  color: active ? 'white' : tokens.text2,
                  fontWeight: '700',
                  fontSize: 12,
                }}
              >
                {c}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {filtered.map((d) => (
        <Pressable
          key={d.name}
          accessibilityRole="button"
          accessibilityLabel={`Select ${d.name}`}
          onPress={() => selectDrug(d)}
          style={{
            backgroundColor: tokens.card,
            borderRadius: 12,
            paddingVertical: 11,
            paddingHorizontal: 13,
            marginBottom: 8,
            borderWidth: 2,
            borderColor: tokens.border,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 9,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              backgroundColor: '#F0FDFA',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Pill size={18} color="#0D9488" />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{ fontWeight: '800', fontSize: 15, color: tokens.text }}
            >
              {d.name}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 12,
                color: tokens.text2,
                fontWeight: '600',
              }}
            >
              {d.brands.slice(0, 3).join(', ')}
            </Text>
          </View>
          <ChevronRight size={15} color={tokens.text2} />
        </Pressable>
      ))}

      {filtered.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 20, paddingHorizontal: 14 }}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '800',
              color: tokens.text2,
              marginBottom: 11,
            }}
          >
            Not in database?
          </Text>
          <TextInput
            value={customDrug}
            onChangeText={setCustomDrug}
            placeholder="Enter medicine name"
            placeholderTextColor={tokens.text2}
            style={{ ...inp, textAlign: 'center' }}
          />
          {customDrug ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue with custom medicine"
              onPress={continueWithCustom}
              style={{
                backgroundColor: '#0D9488',
                borderRadius: 11,
                paddingVertical: 10,
                paddingHorizontal: 18,
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Text
                style={{ color: 'white', fontWeight: '800', fontSize: 15 }}
              >
                Continue with "{customDrug}" →
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );

  // ---- Step 2: schedule form ---------------------------------------------

  const renderStep2 = () => {
    const saveEnabled = canSave();
    const isSaving = createMutation.isPending;
    const saveDisabled = !saveEnabled || isSaving;

    return (
      <View>
        {/* Brand */}
        <Lbl>Brand Name *</Lbl>
        {selDrug ? (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 6,
              marginBottom: 13,
            }}
          >
            {selDrug.brands.map((b) => (
              <Chip
                key={b}
                label={b}
                selected={brand === b}
                onPress={() => setBrand(b)}
              />
            ))}
            <TextInput
              value={brand}
              onChangeText={setBrand}
              placeholder="Or type"
              placeholderTextColor={tokens.text2}
              style={{
                flex: 1,
                minWidth: 100,
                borderWidth: 2,
                borderColor: tokens.border,
                borderRadius: 9,
                paddingVertical: 7,
                paddingHorizontal: 11,
                fontSize: 13,
                fontWeight: '600',
                backgroundColor: tokens.input,
                color: tokens.text,
              }}
            />
          </View>
        ) : (
          <TextInput
            value={brand}
            onChangeText={setBrand}
            placeholder="Brand name"
            placeholderTextColor={tokens.text2}
            style={inp}
          />
        )}

        {/* Dose */}
        <Lbl>Dose / Strength *</Lbl>
        {selDrug ? (
          <>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 6,
                marginBottom: 7,
              }}
            >
              {selDrug.doses.map((d) => (
                <Chip
                  key={d}
                  label={d}
                  selected={dose === d}
                  onPress={() => setDose(d)}
                />
              ))}
              <Chip
                label="Custom"
                selected={dose === 'custom'}
                onPress={() => setDose('custom')}
              />
            </View>
            {dose === 'custom' ? (
              <TextInput
                value={customDose}
                onChangeText={setCustomDose}
                placeholder="e.g. 7.5mg"
                placeholderTextColor={tokens.text2}
                style={{ ...inp, marginTop: 5, marginBottom: 13 }}
              />
            ) : (
              <View style={{ height: 8 }} />
            )}
          </>
        ) : (
          <TextInput
            value={dose}
            onChangeText={setDose}
            placeholder="e.g. 10mg"
            placeholderTextColor={tokens.text2}
            style={inp}
          />
        )}

        {/* Schedule type */}
        <Lbl>Schedule Type *</Lbl>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginHorizontal: -3.5,
            marginBottom: 13,
          }}
        >
          {SCHEDULE_OPTIONS.map((opt) => {
            const active = scheduleType === opt.id;
            return (
              <View
                key={opt.id}
                style={{ width: '50%', paddingHorizontal: 3.5, marginBottom: 7 }}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setScheduleType(opt.id)}
                  style={{
                    backgroundColor: active ? '#F0FDFA' : tokens.card2,
                    borderWidth: 2,
                    borderColor: active ? '#0D9488' : tokens.border,
                    borderRadius: 11,
                    paddingVertical: 10,
                    paddingHorizontal: 9,
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Text style={{ fontSize: 20 }}>{opt.emoji}</Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '800',
                      color: active ? '#0D9488' : tokens.text,
                      textAlign: 'center',
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* Weekly: pick day */}
        {scheduleType === 'weekly' ? (
          <>
            <Lbl>Pick Day of Week</Lbl>
            <View
              style={{ flexDirection: 'row', gap: 5, marginBottom: 13 }}
            >
              {DOW_SHORT.map((d, i) => {
                const active = weekDay === i;
                return (
                  <Pressable
                    key={i}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setWeekDay(i)}
                    style={{
                      flex: 1,
                      backgroundColor: active ? '#0D9488' : tokens.card2,
                      borderWidth: 2,
                      borderColor: active ? '#0D9488' : tokens.border,
                      borderRadius: 9,
                      paddingVertical: 9,
                      paddingHorizontal: 4,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: '800',
                        fontSize: 12,
                        color: active ? 'white' : tokens.text,
                      }}
                    >
                      {d}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {/* Daily: exclude days */}
        {scheduleType === 'daily' ? (
          <>
            <Lbl>Skip these days (optional)</Lbl>
            <View
              style={{ flexDirection: 'row', gap: 5, marginBottom: 13 }}
            >
              {DOW_SHORT.map((d, i) => {
                const active = excludeDays.includes(i);
                return (
                  <Pressable
                    key={i}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => toggleExcludeDay(i)}
                    style={{
                      flex: 1,
                      backgroundColor: active ? '#FEE2E2' : tokens.card2,
                      borderWidth: 2,
                      borderColor: active ? '#FCA5A5' : tokens.border,
                      borderRadius: 9,
                      paddingVertical: 9,
                      paddingHorizontal: 4,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: '800',
                        fontSize: 12,
                        color: active ? '#DC2626' : tokens.text2,
                      }}
                    >
                      {d}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {/* Dose control or tapering */}
        {scheduleType !== 'tapering' ? (
          <>
            <Lbl>
              <Text>Dose at Each Time * </Text>
              <Text
                style={{ fontWeight: '600', color: tokens.text2, fontSize: 12 }}
              >
                — +/- adjusts in ½ tablet steps
              </Text>
            </Lbl>
            <DoseControl schedule={doseSchedule} setter={setDoseSchedule} />
          </>
        ) : (
          <>
            <Lbl>Tapering Schedule (e.g. for steroid taper)</Lbl>
            <TaperingBuilder
              phases={taperingPhases}
              setPhases={setTaperingPhases}
            />
          </>
        )}

        {/* Food timing */}
        <Lbl>Food Instructions *</Lbl>
        <View style={{ flexDirection: 'column', gap: 5, marginBottom: 13 }}>
          {FOOD_TID.map((id, i) => {
            const active = foodTiming === id;
            return (
              <Pressable
                key={id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setFoodTiming(id)}
                style={{
                  backgroundColor: active ? '#F0FDFA' : tokens.card2,
                  borderWidth: 2,
                  borderColor: active ? '#0D9488' : tokens.border,
                  borderRadius: 9,
                  paddingVertical: 9,
                  paddingHorizontal: 11,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <Text style={{ fontSize: 14 }}>{FOOD_ICONS[i]}</Text>
                <Text
                  style={{
                    fontWeight: '700',
                    fontSize: 14,
                    color: active ? '#0D9488' : tokens.text,
                    flex: 1,
                  }}
                >
                  {FOOD_LABELS[i]}
                </Text>
                {active ? <Check size={15} color="#0D9488" /> : null}
              </Pressable>
            );
          })}
        </View>

        {/* Duration */}
        {scheduleType !== 'tapering' ? (
          <>
            <Lbl>Duration (days)</Lbl>
            <TextInput
              value={String(durationDays)}
              onChangeText={(v) => {
                const n = parseInt(v, 10);
                setDurationDays(Number.isFinite(n) && n > 0 ? n : 30);
              }}
              keyboardType="numeric"
              style={inp}
            />
          </>
        ) : null}

        {/* Start date */}
        <Lbl>Start Date</Lbl>
        <TextInput
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={tokens.text2}
          autoCapitalize="none"
          autoCorrect={false}
          style={inp}
        />

        {/* Reminder time */}
        <Lbl>Reminder Time (optional)</Lbl>
        <TextInput
          value={reminderTime}
          onChangeText={setReminderTime}
          placeholder="HH:MM"
          placeholderTextColor={tokens.text2}
          autoCapitalize="none"
          autoCorrect={false}
          style={inp}
        />

        {/* Notes */}
        <Lbl>Notes (optional)</Lbl>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Special instructions..."
          placeholderTextColor={tokens.text2}
          style={{ ...inp, marginBottom: 14 }}
        />

        {/* Doctor's tip */}
        {selDrug?.tip ? (
          <View
            style={{
              backgroundColor: '#FEF3C7',
              borderWidth: 1,
              borderColor: '#F59E0B',
              borderRadius: 11,
              paddingVertical: 10,
              paddingHorizontal: 12,
              marginBottom: 14,
              flexDirection: 'row',
              gap: 8,
            }}
          >
            <Info size={15} color="#D97706" style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontWeight: '800',
                  color: '#92400E',
                  fontSize: 13,
                  marginBottom: 2,
                }}
              >
                Doctor's Tip
              </Text>
              <Text style={{ fontSize: 13, color: '#78350F', lineHeight: 19 }}>
                {selDrug.tip}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Save */}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: saveDisabled }}
          onPress={saveDisabled ? undefined : handleSave}
          disabled={saveDisabled}
          style={{ borderRadius: 13, overflow: 'hidden', marginBottom: 8 }}
        >
          {saveEnabled ? (
            <LinearGradient
              colors={isSaving ? ['#94A3B8', '#64748B'] : ['#0D9488', '#0284C7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingVertical: 14, alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>
                {isSaving ? 'Saving...' : '💊 Save Medicine'}
              </Text>
            </LinearGradient>
          ) : (
            <View
              style={{
                backgroundColor: '#CBD5E1',
                paddingVertical: 14,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>
                💊 Save Medicine
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: tokens.bg }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={tokens.header.colors}
        start={tokens.header.start}
        end={tokens.header.end}
        style={{ paddingTop: 44, paddingBottom: 16, paddingHorizontal: 18 }}
      >
        <View
          style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={handleHeaderBack}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 8,
              padding: 6,
            }}
          >
            <ArrowLeft size={18} color="white" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: 'white' }}>
              {step === 1 ? 'Select Medicine' : 'Configure Schedule'}
            </Text>
            <Text
              style={{
                fontSize: 12,
                opacity: 0.8,
                color: 'white',
                marginTop: 1,
              }}
            >
              Step {step} of 2
            </Text>
          </View>
        </View>
        <ProgressDots total={2} current={step - 1} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 13, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            {step === 1 ? renderStep1() : renderStep2()}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}
