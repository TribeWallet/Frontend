import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({
  id: 'tribewallet-storage',
});

export const StorageKeys = {
  user: 'user.profile',
  auth: 'user.auth',
  preferences: 'user.preferences',
  cache: 'cache',
} as const;

export function getStoredValue<T>(key: string): T | null {
  const value = storage.getString(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function setStoredValue<T>(key: string, value: T): void {
  storage.set(key, JSON.stringify(value));
}

export function removeStoredValue(key: string): void {
  storage.remove(key);
}