import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = AsyncStorage;

export const StorageKeys = {
  user: 'user.profile',
  auth: 'user.auth',
  preferences: 'user.preferences',
  cache: 'cache',
  groupTones: 'groups.tones',
} as const;

export async function getStoredValue<T>(key: string): Promise<T | null> {
  try {
    const value = await storage.getItem(key);
    if (value === null) return null;
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function setStoredValue<T>(key: string, value: T): Promise<void> {
  await storage.setItem(key, JSON.stringify(value));
}

export async function removeStoredValue(key: string): Promise<void> {
  await storage.removeItem(key);
}