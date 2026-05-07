import { useCallback } from 'react';
import { useLanguageStore, type Language } from '@/lib/languageStore';
import { STRINGS, type StringKey } from './strings';

/**
 * Pure lookup. Exported for unit testability — no React, no store access.
 * - Returns STRINGS[language][key] if present
 * - Falls back to STRINGS.en[key]
 * - Falls back to the literal key string (visible dev signal for missing keys)
 * - Substitutes {var} placeholders; missing vars stay literal
 */
export function lookup(
  language: Language,
  key: StringKey,
  vars?: Record<string, string | number>
): string {
  const translation: string =
    (STRINGS[language] as Record<StringKey, string>)[key] ?? STRINGS.en[key] ?? (key as string);
  if (!vars) return translation;
  return translation.replace(/\{(\w+)\}/g, (_, k) => {
    const v = vars[k];
    return v === undefined ? `{${k}}` : String(v);
  });
}

/**
 * Returns a translation function `t(key, vars?)`. Subscribes to useLanguageStore
 * so consumers re-render when language changes.
 */
export function useT() {
  const language = useLanguageStore((s) => s.language);
  return useCallback(
    (key: StringKey, vars?: Record<string, string | number>): string =>
      lookup(language, key, vars),
    [language]
  );
}
