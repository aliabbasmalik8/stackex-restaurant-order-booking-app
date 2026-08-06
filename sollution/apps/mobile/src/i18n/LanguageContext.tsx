import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { reloadAppAsync } from 'expo';
import * as Localization from 'expo-localization';
import i18n, {
  LANGUAGE_STORAGE_KEY,
  LOCALE_META,
  SUPPORTED_LOCALES,
  type AppLocale,
} from '@/i18n';

type LanguageContextValue = {
  locale: AppLocale;
  isRTL: boolean;
  ready: boolean;
  setLocale: (next: AppLocale) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

const isAppLocale = (value: string | null | undefined): value is AppLocale =>
  !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);

const deviceLocale = (): AppLocale => {
  const tag = Localization.getLocales()[0]?.languageCode ?? 'en';
  return isAppLocale(tag) ? tag : 'en';
};

const applyRtl = (locale: AppLocale) => {
  const shouldRTL = LOCALE_META[locale].rtl;
  if (I18nManager.isRTL !== shouldRTL) {
    I18nManager.allowRTL(shouldRTL);
    I18nManager.forceRTL(shouldRTL);
    return true;
  }
  return false;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { i18n: i18nInstance } = useTranslation();
  const [locale, setLocaleState] = useState<AppLocale>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        const next: AppLocale = isAppLocale(stored) ? stored : deviceLocale();

        await i18n.changeLanguage(next);
        if (!mounted) return;

        setLocaleState(next);
        applyRtl(next);

        // Persist device fallback so next launch is stable
        if (!isAppLocale(stored)) {
          await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, next);
        }
      } catch {
        const fallback = deviceLocale();
        await i18n.changeLanguage(fallback);
        if (mounted) setLocaleState(fallback);
      } finally {
        if (mounted) setReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onChanged = (lng: string) => {
      if (isAppLocale(lng)) setLocaleState(lng);
    };
    i18nInstance.on('languageChanged', onChanged);
    return () => {
      i18nInstance.off('languageChanged', onChanged);
    };
  }, [i18nInstance]);

  const setLocale = useCallback(
    async (next: AppLocale) => {
      if (next === locale) {
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, next);
        return;
      }

      const prevRTL = LOCALE_META[locale].rtl;
      const nextRTL = LOCALE_META[next].rtl;

      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, next);
      await i18n.changeLanguage(next);
      setLocaleState(next);

      if (prevRTL !== nextRTL) {
        applyRtl(next);
        try {
          await reloadAppAsync();
        } catch {
          // Expo Go / web may not support reload — UI strings still update
        }
      }
    },
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      isRTL: LOCALE_META[locale].rtl,
      ready,
      setLocale,
    }),
    [locale, ready, setLocale],
  );

  // Hold children until stored locale is loaded so UI doesn't flash the wrong language
  if (!ready) return null;

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
