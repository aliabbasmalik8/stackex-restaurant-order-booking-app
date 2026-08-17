import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { ar } from './locales/ar'
import { en } from './locales/en'

export const SUPPORTED_LOCALES = ['en', 'ar'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export const LOCALE_META: Record<
  AppLocale,
  {
    nameKey: 'languages.en' | 'languages.ar'
    nativeKey: 'languages.enNative' | 'languages.arNative'
    rtl: boolean
  }
> = {
  en: {
    nameKey: 'languages.en',
    nativeKey: 'languages.enNative',
    rtl: false,
  },
  ar: {
    nameKey: 'languages.ar',
    nativeKey: 'languages.arNative',
    rtl: true,
  },
}

export const LANGUAGE_STORAGE_KEY = '@order-booking/web-locale'

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
