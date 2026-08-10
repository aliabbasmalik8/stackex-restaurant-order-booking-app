type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>
}

export const en = {
  common: {
    loading: 'Loading…',
    retry: 'Try again',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
  },
  languages: {
    title: 'Language',
    en: 'English',
    ar: 'Arabic',
    enNative: 'English',
    arNative: 'العربية',
  },
  welcome: {
    title: 'Welcome',
    body:
      'Admin scaffold is ready. Theme tokens follow the mobile app — change brand.paletteId to re-skin.',
    cta: 'Get started',
  },
} as const

export type TranslationSchema = DeepStringify<typeof en>
