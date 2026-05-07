import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import AppointmentCard from './AppointmentCard';
import { useAppointments } from '@/lib/queries';
import type { Appointment } from '@/lib/api';
import { today } from '@/lib/schedule';
import { useTheme } from '@/lib/themeStore';
import { useT } from '@/lib/i18n/useT';

export default function Appointments() {
  const { tokens } = useTheme();
  const t = useT();
  const router = useRouter();
  const apptsQ = useAppointments();
  const todayStr = today();

  const { upcoming, past } = useMemo(() => {
    const all = apptsQ.data ?? [];
    const upcoming: Appointment[] = [];
    const past: Appointment[] = [];
    for (const a of all) {
      if (a.completed || a.appointmentDate < todayStr) past.push(a);
      else upcoming.push(a);
    }
    upcoming.sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate));
    past.sort((a, b) => b.appointmentDate.localeCompare(a.appointmentDate));
    return { upcoming, past };
  }, [apptsQ.data, todayStr]);

  if (apptsQ.isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.bg }}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: tokens.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <SectionHeader>{t('upcoming')}</SectionHeader>
        {upcoming.length === 0 ? (
          <Text style={{ color: tokens.text2, paddingVertical: 12, fontSize: 13 }}>
            {t('no_upcoming')}
          </Text>
        ) : (
          upcoming.map((a) => <AppointmentCard key={a.id} appt={a} />)
        )}

        <SectionHeader>{t('past')}</SectionHeader>
        {past.length === 0 ? (
          <Text style={{ color: tokens.text2, paddingVertical: 12, fontSize: 13 }}>
            {t('no_past')}
          </Text>
        ) : (
          past.map((a) => <AppointmentCard key={a.id} appt={a} />)
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push('/appointments/add' as never)}
        style={{
          position: 'absolute', right: 20, bottom: 24,
          width: 52, height: 52, borderRadius: 26,
          backgroundColor: '#0D9488',
          alignItems: 'center', justifyContent: 'center',
          shadowColor: '#0D9488', shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6,
        }}
      >
        <Plus color="white" size={26} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  const { tokens } = useTheme();
  return (
    <Text style={{ color: tokens.text, fontSize: 14, fontWeight: '800', marginTop: 12, marginBottom: 8 }}>
      {children}
    </Text>
  );
}
