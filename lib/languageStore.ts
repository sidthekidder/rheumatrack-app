import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

export type Language = 'en' | 'hi';

interface LanguageState {
  language: Language;
  setLanguage: (l: Language) => void;
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

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'rt-language',
      storage: createJSONStorage(() => storage),
    }
  )
);
