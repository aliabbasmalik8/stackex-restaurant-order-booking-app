import i18n from '@/i18n';
import { ApiError } from '@/api/OrderBooking/client';

export type UserErrorDetail = {
  english?: string;
  arabic?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asUserErrorDetail(value: unknown): UserErrorDetail | null {
  if (!isRecord(value)) return null;
  const english =
    typeof value.english === 'string' ? value.english.trim() : '';
  const arabic = typeof value.arabic === 'string' ? value.arabic.trim() : '';
  if (!english && !arabic) return null;
  return { english: english || undefined, arabic: arabic || undefined };
}

/** Pull `user_error_detail` from ApiError / axios-shaped payloads / nested cause. */
export function extractUserErrorDetail(error: unknown): UserErrorDetail | null {
  if (error instanceof ApiError) {
    const fromField = asUserErrorDetail(
      (error as ApiError & { user_error_detail?: unknown }).user_error_detail,
    );
    if (fromField) return fromField;
    if (isRecord(error.data)) {
      const fromData = asUserErrorDetail(error.data.user_error_detail);
      if (fromData) return fromData;
    }
  }

  if (isRecord(error)) {
    const direct = asUserErrorDetail(error.user_error_detail);
    if (direct) return direct;
    if ('data' in error) {
      const data = error.data;
      if (isRecord(data)) {
        const nested = asUserErrorDetail(data.user_error_detail);
        if (nested) return nested;
      }
    }
    if ('cause' in error) {
      const fromCause = extractUserErrorDetail(error.cause);
      if (fromCause) return fromCause;
    }
  }

  return null;
}

function resolveLanguage(): 'en' | 'ar' {
  const lng = (i18n.language ?? 'en').toLowerCase();
  return lng.startsWith('ar') ? 'ar' : 'en';
}

/**
 * User-facing API error string.
 * Prefers backend `user_error_detail` in the current language;
 * otherwise returns `defaultMessage` (required).
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage: string,
): string {
  const detail = extractUserErrorDetail(error);
  if (!detail) return defaultMessage;

  const lang = resolveLanguage();
  const preferred = lang === 'ar' ? detail.arabic : detail.english;
  if (preferred) return preferred;

  const fallback = lang === 'ar' ? detail.english : detail.arabic;
  return fallback || defaultMessage;
}
