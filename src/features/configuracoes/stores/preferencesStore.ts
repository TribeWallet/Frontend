import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { storage, StorageKeys } from '../../../services/storage';

export type AppearanceMode = 'light' | 'dark' | 'system';
export type Currency = 'BRL' | 'USD' | 'EUR';

export interface PreferencesState {
  appearance: AppearanceMode;
  currency: Currency;
  biometricLock: boolean;
  hideValues: boolean;
  defaultGroupId?: string;
  language: 'pt-BR' | 'en-US';
  setAppearance: (mode: AppearanceMode) => void;
  setCurrency: (currency: Currency) => void;
  setBiometricLock: (enabled: boolean) => void;
  setHideValues: (enabled: boolean) => void;
  setDefaultGroupId: (groupId?: string) => void;
  setLanguage: (lang: PreferencesState['language']) => void;
  reset: () => void;
}

const DEFAULT_STATE: Pick<
  PreferencesState,
  'appearance' | 'currency' | 'biometricLock' | 'hideValues' | 'language'
> = {
  appearance: 'light',
  currency: 'BRL',
  biometricLock: false,
  hideValues: false,
  language: 'pt-BR',
};

const mmkvStorage = {
  getItem: (key: string) => {
    const value = storage.getString(key);
    return value ?? null;
  },
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  removeItem: (key: string) => {
    storage.remove(key);
  },
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      setAppearance: (appearance) => set({ appearance }),
      setCurrency: (currency) => set({ currency }),
      setBiometricLock: (biometricLock) => set({ biometricLock }),
      setHideValues: (hideValues) => set({ hideValues }),
      setDefaultGroupId: (defaultGroupId) => set({ defaultGroupId }),
      setLanguage: (language) => set({ language }),
      reset: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: StorageKeys.preferences,
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
