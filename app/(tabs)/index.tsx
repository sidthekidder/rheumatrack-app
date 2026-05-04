import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { Pill } from 'lucide-react-native';
import DoctorCard from '@/components/DoctorCard';
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

  const meds = medsQ.data ?? [];
  const todayMeds = useMemo(() => getMedsForDate(meds, dateStr), [meds, dateStr]);

  const log = useMemo<Record<string, boolean>>(() => {
    const out: Record<string, boolean> = {};
    const entries: MedicationLogEntry[] = logQ.data ?? [];
    for (const e of entries) {
      out[`${e.logDate}_${e.medicineId}_${e.slot}`] = e.taken;
    }
    return out;
  }, [logQ.data]);

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

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: tokens.bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <ProgressHeader
          patientName={patient?.name}
          diagnosis={patient?.diagnosis}
          totalDue={totalDue}
          totalTaken={totalTaken}
        />

        <View style={{ paddingTop: 13, paddingHorizontal: 13 }}>
          {hasError ? (
            <Text style={{ color: '#DC2626', fontSize: 13, fontWeight: '600', marginBottom: 10 }}>
              Couldn’t load some data. Pull to refresh.
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
              <Pill size={17} color="#0D9488" />
              <Text style={{ color: '#0D9488', fontWeight: '700', fontSize: 14 }}>
                View All Medicines
              </Text>
            </Pressable>
          ) : null}

          {patient?.doctorName && patient?.doctorPhone ? (
            <DoctorCard
              name={patient.doctorName}
              specialty={patient.doctorSpecialty}
              phone={patient.doctorPhone}
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
