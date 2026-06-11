import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import Logo from '@/components/Logo';
import Wordmark from '@/components/Wordmark';
import { Slot, useRouter, useSegments } from 'expo-router';
import { Session } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { usePatient } from '../lib/queries';
import { useReminderScheduler } from '../lib/notifications';
import { useOtaUpdates } from '../lib/updates';

function describeThrown(error: unknown): { headline: string; body: string } {
  if (error instanceof Error) {
    return {
      headline: `${error.name}: ${error.message || '(no message)'}`,
      body: error.stack ?? '(no stack)',
    };
  }
  if (typeof error === 'string') {
    return { headline: 'Thrown string', body: error };
  }
  if (error && typeof error === 'object') {
    try {
      // Pull non-enumerable Error-like props plus everything serialisable.
      const e = error as Record<string, unknown>;
      const own = Object.getOwnPropertyNames(error).reduce<Record<string, unknown>>(
        (acc, key) => {
          acc[key] = e[key];
          return acc;
        },
        {},
      );
      return {
        headline: typeof e.message === 'string' ? `Object: ${e.message}` : 'Thrown object (no message)',
        body: JSON.stringify(own, null, 2),
      };
    } catch {
      return { headline: 'Thrown object (unserialisable)', body: String(error) };
    }
  }
  return { headline: 'Thrown value', body: String(error) };
}

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: unknown; info: React.ErrorInfo | null }
> {
  state = { error: null as unknown, info: null as React.ErrorInfo | null };
  static getDerivedStateFromError(error: unknown) {
    return { error };
  }
  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    const { headline, body } = describeThrown(error);
    console.error('[RootErrorBoundary]', headline, '\n', body, '\nComponentStack:', info.componentStack);
    this.setState({ info });
  }
  render() {
    if (this.state.error !== null) {
      const { headline, body } = describeThrown(this.state.error);
      const componentStack = this.state.info?.componentStack ?? '(no component stack)';
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#1F2937' }} contentContainerStyle={{ padding: 24 }}>
          <Text style={{ color: '#F87171', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
            App crashed
          </Text>
          <Text selectable style={{ color: '#FCA5A5', fontSize: 14, marginBottom: 16 }}>
            {headline}
          </Text>
          <Text selectable style={{ color: '#E5E7EB', fontFamily: 'monospace', fontSize: 11, marginBottom: 16 }}>
            {body}
          </Text>
          <Text style={{ color: '#FCD34D', fontSize: 13, fontWeight: '700', marginBottom: 8 }}>
            Component stack
          </Text>
          <Text selectable style={{ color: '#E5E7EB', fontFamily: 'monospace', fontSize: 11 }}>
            {componentStack}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

function BootSplash({ label }: { label: string }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0F172A',
        gap: 24,
      }}
    >
      <Logo size={72} />
      <Wordmark size={32} />
      <Text style={{ color: '#94A3B8', fontSize: 14 }}>Your rheumatology companion</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <SplashPill label="💊 Track meds" />
        <SplashPill label="📊 Log symptoms" />
        <SplashPill label="🧪 Scan labs" />
      </View>
      <ActivityIndicator size="small" color="#14B8A6" style={{ marginTop: 8 }} />
      <Text style={{ color: '#475569', fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function SplashPill({ label }: { label: string }) {
  return (
    <View
      style={{
        backgroundColor: '#1E293B',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#334155',
      }}
    >
      <Text style={{ color: '#CBD5E1', fontSize: 11, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

// Segments reachable without a session. Play Store / App Store require the
// privacy policy URL to be publicly accessible.
const PUBLIC_SEGMENTS: ReadonlySet<string> = new Set(['(auth)', 'privacy', 'delete-account', 'publisher']);

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
      if (!PUBLIC_SEGMENTS.has(group ?? '')) router.replace('/(auth)/login');
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
  useOtaUpdates();
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
