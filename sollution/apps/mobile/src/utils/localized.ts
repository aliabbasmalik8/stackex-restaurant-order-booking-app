import type { AppLocale } from '@/i18n';

/** Pick English or Arabic field based on active locale. */
export const localized = (
  locale: string | AppLocale,
  en: string,
  ar?: string | null,
) => (locale.startsWith('ar') && ar ? ar : en);
