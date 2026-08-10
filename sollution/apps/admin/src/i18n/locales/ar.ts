import type { TranslationSchema } from './en'

export const ar: TranslationSchema = {
  common: {
    loading: 'جاري التحميل…',
    retry: 'أعد المحاولة',
    close: 'إغلاق',
    save: 'حفظ',
    cancel: 'إلغاء',
  },
  languages: {
    title: 'اللغة',
    en: 'الإنجليزية',
    ar: 'العربية',
    enNative: 'English',
    arNative: 'العربية',
  },
  welcome: {
    title: 'مرحباً',
    body:
      'لوحة الإدارة جاهزة. رموز السمة تتبع تطبيق الجوال — غيّر brand.paletteId لإعادة التخصيص.',
    cta: 'ابدأ',
  },
}
