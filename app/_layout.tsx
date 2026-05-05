import { useEffect, useMemo, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { Session } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { usePatient } from '../lib/queries';
import { useReminderScheduler } from '../lib/notifications';

function useAuthGuard(session: Session | null, initialised: boolean) {
  const segments = useSegments();
  const router = useRouter();
  const { data: patient, isLoading: patientLoading } = usePatient({
    enabled: !!session,
  });

  useEffect(() => {
    if (!initialised) return;
    const group = segments[0];

    if (!session) {
      if (group !== '(auth)') router.replace('/(auth)/login');
      return;
    }

    if (patientLoading) return;

    if (patient == null) {
      if (group !== '(onboarding)') router.replace('/(onboarding)/welcome');
      return;
    }

    if (group === '(auth)' || group === '(onboarding)') {
      router.replace('/(tabs)');
    }
  }, [session, segments, initialised, patientLoading, patient, router]);
}

function Gate({ session, initialised }: { session: Session | null; initialised: boolean }) {
  useAuthGuard(session, initialised);
  useReminderScheduler();
  if (!initialised) return null;
  return <Slot />;
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialised, setInitialised] = useState(false);

  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } }),
    [],
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialised(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Gate session={session} initialised={initialised} />
    </QueryClientProvider>
  );
}
