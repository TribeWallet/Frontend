import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { storage, StorageKeys } from '../../../services/storage';

export interface UserProfile {
  id: string;
  initials: string;
  name: string;
  email: string;
  notificationCount: number;
}

export interface ProfileStats {
  value: string;
  label: string;
}

interface UserState {
  profile: UserProfile | null;
  stats: ProfileStats[];
  isAuthenticated: boolean;
  setProfile: (profile: UserProfile) => void;
  setStats: (stats: ProfileStats[]) => void;
  logout: () => void;
}

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

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      stats: [],
      isAuthenticated: false,
      setProfile: (profile) =>
        set({ profile, isAuthenticated: true }),
      setStats: (stats) => set({ stats }),
      logout: () =>
        set({ profile: null, stats: [], isAuthenticated: false }),
    }),
    {
      name: StorageKeys.user,
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);