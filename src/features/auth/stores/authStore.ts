import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { storage, StorageKeys } from '../../../services/storage';

export interface AuthUser {
  /** usuarioToken do backend. */
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  initials: string;
  notificationCount?: number;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: AuthUser | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateUser: (patch: Partial<AuthUser>) => void;
}

const mmkvStorage = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.remove(key),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      login: (user, token) =>
        set({
          isAuthenticated: true,
          token,
          user,
        }),
      logout: () =>
        set({
          isAuthenticated: false,
          token: null,
          user: null,
        }),
      updateUser: (patch) =>
        set((state) =>
          state.user
            ? { user: { ...state.user, ...patch } }
            : state,
        ),
    }),
    {
      name: StorageKeys.auth,
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        user: state.user,
      }),
      // A versão 0 guardava a sessão falsa do login de desenvolvimento; descarta para exigir login real.
      version: 1,
      migrate: () => ({ isAuthenticated: false, token: null, user: null }),
    },
  ),
);
