import { useCallback } from 'react';
import { useLanguageStore } from '@/lib/languageStore';
import { STRINGS, type StringKey } from './strings';

/**
 * Returns a translation function `t(key, vars?)`:
 * - Looks up the key in the active language's STRINGS table
 * - Falls back to English if missing in the active language
 * - Falls back to the literal key string if missing in both (visible-but-non-crashing dev signal)
 * - Substitutes {var} placeholders with provided values
 *
 * Subscribes to useLanguageStore so consumers re-render when language changes.
 */
export function useT() {
  const language = useLanguageStore((s) => s.language);
  return useCallback(
    (key: StringKey, vars?: Record<string, string | number>): string => {
      const translation: string =
        (STRINGS[language] as Record<StringKey, string>)[key] ?? STRINGS.en[key] ?? (key as string);
      if (!vars) return translation;
      return translation.replace(/\{(\w+)\}/g, (_, k) => {
        const v = vars[k];
        return v === undefined ? `{${k}}` : String(v);
      });
    },
    [language]
  );
}
