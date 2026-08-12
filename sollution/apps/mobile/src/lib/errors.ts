export type AppErrorCode =
  | 'config_missing'
  | 'network'
  | 'permission'
  | 'not_found'
  | 'empty'
  | 'store_closed'
  | 'unknown';

/** Machine-readable error; UI maps `code` → i18n, never shows raw messages. */
export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly cause?: unknown;

  constructor(code: AppErrorCode, cause?: unknown) {
    super(code);
    this.name = 'AppError';
    this.code = code;
    this.cause = cause;
  }
}

const SETUP_HINT =
  'API is not reachable. Set EXPO_PUBLIC_API_URL in apps/mobile/.env (e.g. http://localhost:8000).';

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  const status =
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number'
      ? (error as { status: number }).status
      : 0;

  const message =
    error instanceof Error ? error.message : String(error ?? '');

  if (
    status === 0 ||
    /network|offline|failed to fetch|ECONNREFUSED/i.test(message)
  ) {
    return new AppError('network', error);
  }

  if (status === 503 || /unavailable|closed|not available/i.test(message)) {
    return new AppError('store_closed', error);
  }

  if (status === 401 || status === 403 || /permission/i.test(message)) {
    return new AppError('permission', error);
  }

  if (status === 404 || /not found/i.test(message)) {
    return new AppError('not_found', error);
  }

  if (/EXPO_PUBLIC_API_URL|not configured/i.test(message)) {
    if (__DEV__) console.warn(`[api] ${SETUP_HINT}`);
    return new AppError('config_missing', error);
  }

  return new AppError('unknown', error);
}

/** i18n key prefix for StateMessage: `errors.<code>.title` / `.message` */
export const errorTitleKey = (code: AppErrorCode) =>
  `errors.${code}.title` as const;

export const errorMessageKey = (code: AppErrorCode) =>
  `errors.${code}.message` as const;
