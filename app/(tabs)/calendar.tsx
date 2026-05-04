import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react-native';
import DayDetailsSheet from '@/components/DayDetailsSheet';
import MonthGrid, { type MonthCell } from '@/components/MonthGrid';
import type { MedicationLogEntry } from '@/lib/api';
import { useMedicationLog, useMedicines } from '@/lib/queries';
import { getDayCompliance, today } from '@/lib/schedule';
import { useTheme } from '@/lib/themeStore';

interface MonthView {
  year: number;
  month: number; // 0-indexed
}

const pad2 = (n: number): string => String(n).padStart(2, '0');

export default function CalendarScreen() {
  const { tokens } = useTheme();

  const [view, setView] = useState<MonthView>(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const todayStr = useMemo(() => today(), []);

  const { monthStart, monthEnd, daysInMonth, firstDay, monthName } = useMemo(() => {
    const dim = new Date(view.year, view.month + 1, 0).getDate();
    const first = new Date(view.year, view.month, 1).getDay();
    const mm = pad2(view.month + 1);
    let label: string;
    try {
      label = new Date(view.year, view.month).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    } catch {
      label = `${view.year}-${mm}`;
    }
    return {
      monthStart: `${view.year}-${mm}-01`,
      monthEnd: `${view.year}-${mm}-${pad2(dim)}`,
      daysInMonth: dim,
      firstDay: first,
      monthName: label,
    };
  }, [view]);

  const medsQ = useMedicines();
  const logQ = useMedicationLog(monthStart, monthEnd);

  const meds = medsQ.data;

  const log = useMemo<Record<string, boolean>>(() => {
    const out: Record<string, boolean> = {};
    const entries = logQ.data;
    if (!entries) return out;
    for (const e of entries as MedicationLogEntry[]) {
      out[`${e.logDate}_${e.medicineId}_${e.slot}`] = e.taken;
    }
    return out;
  }, [logQ.data]);

  const cells = useMemo<Array<MonthCell | null>>(() => {
    const arr: Array<MonthCell | null> = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    const medList = meds ?? [];
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${view.year}-${pad2(view.month + 1)}-${pad2(d)}`;
      const isFuture = ds > todayStr;
      const isToday = ds === todayStr;
      if (isFuture) {
        arr.push({
          day: d,
          dateStr: ds,
          isToday,
          isFuture,
          color: 'future',
          due: 0,
          taken: 0,
        });
      } else {
        const comp = getDayCompliance(medList, log, ds);
        arr.push({
          day: d,
          dateStr: ds,
          isToday,
          isFuture,
          color: comp.color,
          due: comp.due,
          taken: comp.taken,
        });
      }
    }
    return arr;
  }, [firstDay, daysInMonth, view, meds, log, todayStr]);

  const { greenDays, yellowDays, redDays, total, compliance } = useMemo(() => {
    const monthDays = cells.filter(
      (c): c is MonthCell => c !== null && !c.isFuture && c.due > 0,
    );
    const g = monthDays.filter((c) => c.color === 'green').length;
    const y = monthDays.filter((c) => c.color === 'yellow').length;
    const r = monthDays.filter((c) => c.color === 'red').length;
    const t = monthDays.length;
    const pct = t > 0 ? Math.round((g / t) * 100) : 0;
    return { greenDays: g, yellowDays: y, redDays: r, total: t, compliance: pct };
  }, [cells]);

  const goPrev = useCallback(() => {
    setView(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 },
    );
  }, []);

  const goNext = useCallback(() => {
    setView(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 },
    );
  }, []);

  const refreshing = medsQ.isFetching || logQ.isFetching;
  const onRefresh = useCallback(() => {
    medsQ.refetch();
    logQ.refetch();
  }, [medsQ, logQ]);

  if (medsQ.isLoading || logQ.isLoading) {
    return (
      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        style={{ flex: 1, backgroundColor: tokens.bg }}
      >
        <StatusBar style="light" />
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator size="large" color="#0D9488" />
        </View>
      </SafeAreaView>
    );
  }

  const complianceBg =
    compliance >= 80 ? '#16A34A' : compliance >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={{ flex: 1, backgroundColor: tokens.bg }}
    >
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={tokens.text2}
          />
        }
      >
        {/* Gradient header */}
        <LinearGradient
          colors={tokens.header.colors}
          start={tokens.header.start}
          end={tokens.header.end}
          style={{ paddingTop: 22, paddingHorizontal: 18, paddingBottom: 16 }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 9,
              marginBottom: 4,
            }}
          >
            <CalendarDays size={22} color="white" />
            <Text style={{ fontSize: 22, fontWeight: '900', color: 'white' }}>
              Compliance Calendar
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: 'white', opacity: 0.85 }}>
            Track your medication adherence — show this to your doctor
          </Text>
        </LinearGradient>

        <View style={{ padding: 13 }}>
          {/* Month nav */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: tokens.card,
              borderRadius: 13,
              paddingVertical: 9,
              paddingHorizontal: 13,
              marginBottom: 13,
              borderWidth: 2,
              borderColor: tokens.border,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              onPress={goPrev}
              style={{
                backgroundColor: tokens.card2,
                borderRadius: 9,
                padding: 7,
              }}
            >
              <ChevronLeft size={20} color={tokens.text} />
            </Pressable>
            <Text
              style={{ fontWeight: '800', fontSize: 17, color: tokens.text }}
            >
              {monthName}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next month"
              onPress={goNext}
              style={{
                backgroundColor: tokens.card2,
                borderRadius: 9,
                padding: 7,
              }}
            >
              <ChevronRight size={20} color={tokens.text} />
            </Pressable>
          </View>

          {/* Monthly compliance summary */}
          {total > 0 ? (
            <View
              style={{
                backgroundColor: tokens.card,
                borderRadius: 13,
                padding: 13,
                marginBottom: 13,
                borderWidth: 2,
                borderColor: tokens.border,
              }}
            >
              <Text
                style={{
                  fontWeight: '800',
                  color: tokens.text2,
                  fontSize: 11,
                  marginBottom: 9,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Monthly Compliance
              </Text>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}
              >
                <View
                  style={{
                    backgroundColor: complianceBg,
                    borderRadius: 50,
                    width: 64,
                    height: 64,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: '900',
                      fontSize: 18,
                    }}
                  >
                    {compliance}%
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <ComplianceLine
                    color="#16A34A"
                    label="All taken"
                    days={greenDays}
                    text={tokens.text}
                  />
                  <ComplianceLine
                    color="#F59E0B"
                    label="Some missed"
                    days={yellowDays}
                    text={tokens.text}
                  />
                  <ComplianceLine
                    color="#EF4444"
                    label="None taken"
                    days={redDays}
                    text={tokens.text}
                    last
                  />
                </View>
              </View>
            </View>
          ) : null}

          {/* Legend */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 7,
              marginBottom: 11,
            }}
          >
            <LegendChip color="#16A34A" label="All taken" />
            <LegendChip color="#F59E0B" label="Some missed" />
            <LegendChip color="#EF4444" label="None taken" />
            <LegendChip
              color={tokens.card2}
              label="No meds"
              borderColor={tokens.border}
            />
          </View>

          {/* Grid */}
          <MonthGrid cells={cells} onDayPress={setSelectedDay} />
        </View>
      </ScrollView>

      <DayDetailsSheet
        dateStr={selectedDay}
        meds={meds ?? []}
        log={log}
        onClose={() => setSelectedDay(null)}
      />
    </SafeAreaView>
  );
}

function ComplianceLine({
  color,
  label,
  days,
  text,
  last,
}: {
  color: string;
  label: string;
  days: number;
  text: string;
  last?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: last ? 0 : 3,
      }}
    >
      <Text style={{ color, fontWeight: '700', fontSize: 13 }}>{label}</Text>
      <Text style={{ fontWeight: '700', color: text, fontSize: 13 }}>
        {days} {days === 1 ? 'day' : 'days'}
      </Text>
    </View>
  );
}

function LegendChip({
  color,
  label,
  borderColor,
}: {
  color: string;
  label: string;
  borderColor?: string;
}) {
  const { tokens } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View
        style={{
          width: 11,
          height: 11,
          borderRadius: 50,
          backgroundColor: color,
          borderWidth: borderColor ? 1 : 0,
          borderColor: borderColor ?? 'transparent',
        }}
      />
      <Text style={{ fontSize: 11, fontWeight: '600', color: tokens.text2 }}>
        {label}
      </Text>
    </View>
  );
}
