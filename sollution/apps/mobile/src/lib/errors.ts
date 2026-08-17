import i18n from '@/i18n';
import { ApiError } from '@/api/OrderBooking/client';

export type AppErrorCode =
  | 'config_missing'
  | 'network'
  | 'permission'
  | 'not_found'
  | 'empty'
  | 'store_closed'
  | 'item_unavailable'
  | 'branch_unavailable'
  | 'out_of_delivery_range'
  | 'delivery_address_required'
  | 'unknown';

export type UserErrorDetail = {
  english?: string;
  arabic?: string;
};

/** Machine-readable error; UI maps `code` → i18n when no `user_error_detail`. */
export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly cause?: unknown;
  /** Menu item ids rejected at checkout (86 / missing / wrong branch). */
  readonly unavailableMenuItemIds?: string[];
  readonly user_error_detail?: UserErrorDetail;

  constructor(
    code: AppErrorCode,
    cause?: unknown,
    unavailableMenuItemIds?: string[],
    user_error_detail?: UserErrorDetail,
  ) {
    super(code);
    this.name = 'AppError';
    this.code = code;
    this.cause = cause;
    this.unavailableMenuItemIds = unavailableMenuItemIds;
    this.user_error_detail = user_error_detail;
  }
}

const SETUP_HINT =
  'API is not reachable. Set EXPO_PUBLIC_API_URL in apps/mobile/.env (e.g. http://localhost:8000).';

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

export function extractUserErrorDetail(error: unknown): UserErrorDetail | null {
  if (error instanceof AppError && error.user_error_detail) {
    return asUserErrorDetail(error.user_error_detail);
  }
  if (error instanceof ApiError) {
    const fromField = asUserErrorDetail(error.user_error_detail);
    if (fromField) return fromField;
    if (isRecord(error.data)) {
      const fromData = asUserErrorDetail(error.data.user_error_detail);
      if (fromData) return fromData;
    }
  }
  if (isRecord(error)) {
    const direct = asUserErrorDetail(error.user_error_detail);
    if (direct) return direct;
    if ('data' in error && isRecord(error.data)) {
      const nested = asUserErrorDetail(error.data.user_error_detail);
      if (nested) return nested;
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

function readApiPayload(error: unknown): {
  status: number;
  message: string;
  code?: string;
  unavailableMenuItemIds?: string[];
  user_error_detail?: UserErrorDetail;
} {
  const status =
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number'
      ? (error as { status: number }).status
      : 0;

  const data =
    typeof error === 'object' &&
    error !== null &&
    'data' in error
      ? (error as { data: unknown }).data
      : undefined;

  const payload =
    typeof data === 'object' && data !== null
      ? (data as Record<string, unknown>)
      : null;

  const nestedMessage =
    payload &&
    typeof payload.message === 'object' &&
    payload.message !== null &&
    !Array.isArray(payload.message)
      ? (payload.message as Record<string, unknown>)
      : null;

  const code =
    (typeof payload?.code === 'string' && payload.code) ||
    (typeof nestedMessage?.code === 'string' && nestedMessage.code) ||
    undefined;

  const unavailableRaw =
    payload?.unavailableMenuItemIds ?? nestedMessage?.unavailableMenuItemIds;
  const unavailableMenuItemIds = Array.isArray(unavailableRaw)
    ? unavailableRaw.filter((id): id is string => typeof id === 'string')
    : undefined;

  const user_error_detail =
    extractUserErrorDetail(error) ??
    asUserErrorDetail(payload?.user_error_detail) ??
    undefined;

  const messageFromPayload =
    typeof payload?.message === 'string'
      ? payload.message
      : typeof nestedMessage?.message === 'string'
        ? nestedMessage.message
        : Array.isArray(payload?.message)
          ? String(payload.message[0] ?? '')
          : '';

  const message =
    messageFromPayload ||
    (error instanceof Error ? error.message : String(error ?? ''));

  return { status, message, code, unavailableMenuItemIds, user_error_detail: user_error_detail ?? undefined };
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  const { status, message, code, unavailableMenuItemIds, user_error_detail } =
    readApiPayload(error);

  const wrap = (appCode: AppErrorCode) =>
    new AppError(appCode, error, unavailableMenuItemIds, user_error_detail);

  if (code === 'ITEM_UNAVAILABLE') {
    return wrap('item_unavailable');
  }
  if (code === 'BRANCH_UNAVAILABLE') {
    return wrap('branch_unavailable');
  }
  if (code === 'OUT_OF_DELIVERY_RANGE') {
    return wrap('out_of_delivery_range');
  }
  if (code === 'DELIVERY_ADDRESS_REQUIRED') {
    return wrap('delivery_address_required');
  }

  if (
    status === 0 ||
    /network|offline|failed to fetch|ECONNREFUSED/i.test(message)
  ) {
    return wrap('network');
  }

  if (status === 503 || /store is currently unavailable|closed/i.test(message)) {
    return wrap('store_closed');
  }

  if (status === 401 || status === 403 || /permission/i.test(message)) {
    return wrap('permission');
  }

  if (status === 404 || /not found/i.test(message)) {
    return wrap('not_found');
  }

  if (/EXPO_PUBLIC_API_URL|not configured/i.test(message)) {
    if (__DEV__) console.warn(`[api] ${SETUP_HINT}`);
    return wrap('config_missing');
  }

  if (
    status === 400 &&
    /no longer available|item.*unavailable|sold.?out/i.test(message)
  ) {
    return wrap('item_unavailable');
  }

  return wrap('unknown');
}

/** i18n key prefix for StateMessage: `errors.<code>.title` / `.message` */
export const errorTitleKey = (code: AppErrorCode) =>
  `errors.${code}.title` as const;

export const errorMessageKey = (code: AppErrorCode) =>
  `errors.${code}.message` as const;
