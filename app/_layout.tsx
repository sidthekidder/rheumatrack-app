import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { Session } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { usePatient } from '../lib/queries';
import { useReminderScheduler } from '../lib/notifications';

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[RootErrorBoundary]', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#1F2937' }} contentContainerStyle={{ padding: 24 }}>
          <Text style={{ color: '#F87171', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
            App crashed
          </Text>
          <Text style={{ color: '#FCA5A5', fontSize: 14, marginBottom: 16 }}>
            {this.state.error.name}: {this.state.error.message}
          </Text>
          <Text selectable style={{ color: '#E5E7EB', fontFamily: 'monospace', fontSize: 11 }}>
            {this.state.error.stack ?? '(no stack)'}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

function BootSplash({ label }: { label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A' }}>
      <ActivityIndicator size="large" color="#14B8A6" />
      <Text style={{ color: '#E2E8F0', marginTop: 12, fontSize: 14 }}>{label}</Text>
    </View>
  );
}

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
  if (!initialised) return <BootSplash label="Loading…" />;
  return <Slot />;
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialised, setInitialised] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } }),
    [],
  );

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setInitialised(true);
      })
      .catch((err) => {
        console.error('[supabase.getSession]', err);
        setAuthError(err?.message ?? String(err));
        setInitialised(true);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authError) {
    return (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#1F2937', justifyContent: 'center' }}>
        <Text style={{ color: '#F87171', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
          Auth init failed
        </Text>
        <Text style={{ color: '#FCA5A5', fontSize: 14 }}>{authError}</Text>
      </View>
    );
  }

  return (
    <RootErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Gate session={session} initialised={initialised} />
      </QueryClientProvider>
    </RootErrorBoundary>
  );
}
