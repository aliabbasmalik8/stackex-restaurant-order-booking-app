import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import i18n, {
  LANGUAGE_STORAGE_KEY,
  LOCALE_META,
  SUPPORTED_LOCALES,
  type AppLocale,
} from '@/i18n'

type LanguageContextValue = {
  locale: AppLocale
  isRTL: boolean
  ready: boolean
  setLocale: (next: AppLocale) => Promise<void>
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
)

const isAppLocale = (value: string | null | undefined): value is AppLocale =>
  !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value)

const deviceLocale = (): AppLocale => {
  const tag = navigator.language.split('-')[0] ?? 'en'
  return isAppLocale(tag) ? tag : 'en'
}

const applyDocumentLocale = (locale: AppLocale) => {
  const rtl = LOCALE_META[locale].rtl
  document.documentElement.lang = locale
  document.documentElement.dir = rtl ? 'rtl' : 'ltr'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n: i18nInstance } = useTranslation()
  const [locale, setLocaleState] = useState<AppLocale>('en')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true

    void (async () => {
      try {
        const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
        const next: AppLocale = isAppLocale(stored) ? stored : deviceLocale()

        await i18n.changeLanguage(next)
        if (!mounted) return

        setLocaleState(next)
        applyDocumentLocale(next)

        if (!isAppLocale(stored)) {
          localStorage.setItem(LANGUAGE_STORAGE_KEY, next)
        }
      } catch {
        const fallback = deviceLocale()
        await i18n.changeLanguage(fallback)
        if (mounted) {
          setLocaleState(fallback)
          applyDocumentLocale(fallback)
        }
      } finally {
        if (mounted) setReady(true)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const onChanged = (lng: string) => {
      if (isAppLocale(lng)) setLocaleState(lng)
    }
    i18nInstance.on('languageChanged', onChanged)
    return () => {
      i18nInstance.off('languageChanged', onChanged)
    }
  }, [i18nInstance])

  const setLocale = useCallback(
    async (next: AppLocale) => {
      if (next === locale) {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, next)
        return
      }

      localStorage.setItem(LANGUAGE_STORAGE_KEY, next)
      await i18n.changeLanguage(next)
      setLocaleState(next)
      applyDocumentLocale(next)
    },
    [locale],
  )

  const value = useMemo(
    () => ({
      locale,
      isRTL: LOCALE_META[locale].rtl,
      ready,
      setLocale,
    }),
    [locale, ready, setLocale],
  )

  // Hold children until stored locale is loaded so UI doesn't flash the wrong language
  if (!ready) return null

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
