import { useEffect, useMemo, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { Session } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

function useAuthGuard(session: Session | null, initialised: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialised) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, segments, initialised]);
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

  useAuthGuard(session, initialised);

  if (!initialised) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
    </QueryClientProvider>
  );
}
