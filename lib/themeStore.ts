import * as SecureStore from 'expo-secure-store';
import { Platform, useColorScheme } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { darkTokens, lightTokens, type ThemeTokens } from './theme';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}

const webStorage: StateStorage = {
  getItem: (key) =>
    typeof window === 'undefined' ? null : window.localStorage.getItem(key),
  setItem: (key, value) => {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  },
  removeItem: (key) => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
  },
};

const nativeStorage: StateStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: async (key, value) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key) => {
    await SecureStore.deleteItemAsync(key);
  },
};

const storage = Platform.OS === 'web' ? webStorage : nativeStorage;

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'rt-theme',
      storage: createJSONStorage(() => storage),
    }
  )
);

export interface UseThemeResult {
  tokens: ThemeTokens;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}

export function useTheme(): UseThemeResult {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const systemScheme = useColorScheme();
  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
  const tokens = isDark ? darkTokens : lightTokens;
  return { tokens, isDark, mode, setMode };
}
