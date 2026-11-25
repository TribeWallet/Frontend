import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';
import esES from './locales/es-ES.json';

const LANGUAGE_KEY = '@tribe-wallet:language';

export type Language = 'pt-BR' | 'en-US' | 'es-ES';

export const LANGUAGES: { code: Language; name: string }[] = [
  { code: 'pt-BR', name: 'Português' },
  { code: 'en-US', name: 'English' },
  { code: 'es-ES', name: 'Español' },
];

export const getStoredLanguage = async (): Promise<Language> => {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (stored === 'pt-BR' || stored === 'en-US' || stored === 'es-ES') {
      return stored;
    }
  } catch {
    // ignore storage errors
  }
  return 'pt-BR';
};

/** Lê o idioma salvo no AsyncStorage. Retorna null quando nada foi salvo ainda. */
export const getStoredLanguageRaw = async (): Promise<Language | null> => {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (stored === 'pt-BR' || stored === 'en-US' || stored === 'es-ES') {
      return stored;
    }
  } catch {
    // ignore storage errors
  }
  return null;
};

export const setStoredLanguage = async (language: Language): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // ignore storage errors
  }
};

/** Detecta o idioma do dispositivo (iOS/Android) de forma confiável. */
export const getDetectedLanguage = (): Language => {
  try {
    const locales = Localization.getLocales();
    const first = locales[0];
    const normalized = first.languageTag.replace('_', '-') as Language;
    if (normalized === 'pt-BR' || normalized === 'en-US' || normalized === 'es-ES') {
      return normalized;
    }
  } catch {
    // ignore detection errors
  }
  return 'pt-BR';
};

i18n.use(initReactI18next).init({
  resources: {
    'pt-BR': { translation: ptBR },
    'en-US': { translation: enUS },
    'es-ES': { translation: esES },
  },
  lng: 'pt-BR',
  fallbackLng: 'pt-BR',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
