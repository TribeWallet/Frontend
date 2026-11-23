import { useCallback, useEffect, useState } from 'react';
import { useTranslation as useRNTranslation, Trans as RNTrans } from 'react-i18next';
import i18n, { setStoredLanguage, getStoredLanguage, Language, LANGUAGES } from '../i18n';

export function useTranslation() {
  const { t, i18n: i18nInstance, ready } = useRNTranslation();
  const [tick, setTick] = useState(0);

  const changeLanguage = useCallback(
    async (language: Language) => {
      await i18nInstance.changeLanguage(language);
      await setStoredLanguage(language);
      setTick((t) => t + 1);
    },
    [i18nInstance],
  );

  useEffect(() => {
    const handler = () => {
      setTick((t) => t + 1);
    };
    i18nInstance.on('languageChanged', handler);
    return () => {
      i18nInstance.off('languageChanged', handler);
    };
  }, [i18nInstance]);

  const currentLanguage: Language = (i18nInstance.language as Language) || 'pt-BR';

  return {
    t,
    ready,
    language: currentLanguage,
    languages: LANGUAGES,
    changeLanguage,
  };
}

export { RNTrans as Trans };

export { getStoredLanguage };
export type { Language };
