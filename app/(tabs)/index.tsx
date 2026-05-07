import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, type Href } from 'expo-router';
import Logo from '@/components/Logo';
import Wordmark from '@/components/Wordmark';
import DoctorCard from '@/components/DoctorCard';
import DoctorSocialLinks from '@/components/DoctorSocialLinks';
import ProgressHeader from '@/components/ProgressHeader';
import SlotCard from '@/components/SlotCard';
import { TS_DATA, type SlotId } from '@/constants/slots';
import type { MedicationLogEntry } from '@/lib/api';
import {
  useMedicationLog,
  useMedicines,
  usePatient,
  useToggleTaken,
} from '@/lib/queries';
import { getMedsForDate, today } from '@/lib/schedule';
import { useTheme } from '@/lib/themeStore';

export default function HomeScreen() {
  const router = useRouter();
  const { tokens } = useTheme();

  const dateStr = useMemo(() => today(), []);

  const patientQ = usePatient();
  const medsQ = useMedicines();
  const logQ = useMedicationLog(dateStr, dateStr);
  const toggle = useToggleTaken();

  const meds = medsQ.data;
  const todayMeds = useMemo(
    () => (meds ? getMedsForDate(meds, dateStr) : []),
    [meds, dateStr],
  );

  const logEntries = logQ.data;
  const log = useMemo<Record<string, boolean>>(() => {
    const out: Record<string, boolean> = {};
    if (!logEntries) return out;
    for (const e of logEntries as MedicationLogEntry[]) {
      out[`${e.logDate}_${e.medicineId}_${e.slot}`] = e.taken;
    }
    return out;
  }, [logEntries]);

  const isTaken = (medId: string, slot: SlotId): boolean =>
    log[`${dateStr}_${medId}_${slot}`] === true;

  const { totalDue, totalTaken } = useMemo(() => {
    let due = 0;
    let taken = 0;
    for (const m of todayMeds) {
      for (const slot of TS_DATA) {
        const qty = m.dosesToday[slot.id] ?? 0;
        if (qty > 0) {
          due++;
          if (log[`${dateStr}_${m.id}_${slot.id}`]) taken++;
        }
      }
    }
    return { totalDue: due, totalTaken: taken };
  }, [todayMeds, log, dateStr]);

  const onToggle = (medId: string, slot: SlotId) => {
    const currently = isTaken(medId, slot);
    toggle.mutate({ medicineId: medId, logDate: dateStr, slot, taken: !currently });
  };

  const onRefresh = useCallback(() => {
    patientQ.refetch();
    medsQ.refetch();
    logQ.refetch();
  }, [patientQ, medsQ, logQ]);

  if (patientQ.isLoading || medsQ.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: tokens.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  const patient = patientQ.data ?? null;
  const hasError = patientQ.isError || medsQ.isError || logQ.isError;

  const slotsWithMeds = TS_DATA.filter((slot) =>
    todayMeds.some((m) => (m.dosesToday[slot.id] ?? 0) > 0)
  );

  const refreshing = patientQ.isFetching || medsQ.isFetching || logQ.isFetching;

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: tokens.bg }}>
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tokens.text2} />
        }
      >
        <ProgressHeader
          patientName={patient?.name}
          diagnosis={patient?.diagnosis}
          totalDue={totalDue}
          totalTaken={totalTaken}
          isLoading={logQ.isLoading}
        />

        <View style={{ paddingTop: 13, paddingHorizontal: 13 }}>
          {hasError ? (
            <Text style={{ color: '#DC2626', fontSize: 13, fontWeight: '600', marginBottom: 10 }}>
              Couldn't load some data. Pull to refresh.
            </Text>
          ) : null}

          {todayMeds.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: '800',
                  color: tokens.text,
                  marginBottom: 4,
                  textAlign: 'center',
                }}
              >
                No medicines added yet
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: tokens.text2,
                  fontWeight: '600',
                  textAlign: 'center',
                  marginBottom: 18,
                }}
              >
                Tap Scan to upload prescription, or add manually
              </Text>
              <Pressable
                accessibilityRole="button"
                // TODO: remove cast once expo-router types regenerate (T17/T20)
                onPress={() => router.push('/scan' as Href)}
                style={{
                  backgroundColor: '#0D9488',
                  paddingVertical: 12,
                  paddingHorizontal: 22,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>
                  📷 Scan Prescription
                </Text>
              </Pressable>
            </View>
          ) : (
            slotsWithMeds.map((slot) => {
              const slotMeds = todayMeds.filter((m) => (m.dosesToday[slot.id] ?? 0) > 0);
              return (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  meds={slotMeds}
                  isTaken={isTaken}
                  onToggle={onToggle}
                />
              );
            })
          )}

          {todayMeds.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              // TODO: remove cast once expo-router types regenerate (T17/T20)
              onPress={() => router.push('/medicines' as Href)}
              style={{
                backgroundColor: tokens.card,
                borderWidth: 2,
                borderColor: tokens.border,
                borderRadius: 13,
                padding: 11,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                marginBottom: 14,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Logo size={28} />
                <Wordmark size={20} />
              </View>
            </Pressable>
          ) : null}

          {patient?.doctorName && patient?.doctorPhone ? (
            <>
              <DoctorCard
                name={patient.doctorName}
                specialty={patient.doctorSpecialty}
                phone={patient.doctorPhone}
                patientName={patient.name}
                patientId={patient.patientId}
                diagnosis={patient.diagnosis}
              />
              <DoctorSocialLinks
                websiteUrl={patient.doctorWebsiteUrl}
                instagramUrl={patient.doctorInstagramUrl}
                youtubeUrl={patient.doctorYoutubeUrl}
                variant="frosted"
              />
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
