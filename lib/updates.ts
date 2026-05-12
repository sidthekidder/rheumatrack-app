import { useEffect } from 'react';
import * as Updates from 'expo-updates';

export function useOtaUpdates(): void {
  useEffect(() => {
    if (!Updates.isEnabled) return;
    let cancelled = false;
    (async () => {
      try {
        const check = await Updates.checkForUpdateAsync();
        if (cancelled || !check.isAvailable) return;
        await Updates.fetchUpdateAsync();
      } catch (err) {
        console.warn('[ota] check/fetch failed', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
}
