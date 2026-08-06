export type AppErrorCode =
  | 'config_missing'
  | 'network'
  | 'permission'
  | 'not_found'
  | 'empty'
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
  'Firebase is not configured. Copy apps/mobile/.env.example → .env and paste the Web app config from Firebase Console.';

export function assertFirebaseConfigured(configured: boolean): void {
  if (configured) return;
  if (__DEV__) {
    console.warn(`[firebase] ${SETUP_HINT}`);
  }
  throw new AppError('config_missing');
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
      ? (error as { code: string }).code
      : '';

  const message =
    error instanceof Error ? error.message : String(error ?? '');

  if (
    code === 'unavailable' ||
    code === 'deadline-exceeded' ||
    /network|offline|failed to fetch/i.test(message)
  ) {
    return new AppError('network', error);
  }

  if (code === 'permission-denied' || /permission/i.test(message)) {
    return new AppError('permission', error);
  }

  if (code === 'not-found' || /not found/i.test(message)) {
    return new AppError('not_found', error);
  }

  if (/not configured|EXPO_PUBLIC_FIREBASE|\.env/i.test(message)) {
    if (__DEV__) console.warn(`[firebase] ${SETUP_HINT}`);
    return new AppError('config_missing', error);
  }

  // Firestore: nested `undefined`, wrong types, etc.
  if (
    code === 'invalid-argument' ||
    /unsupported field value|undefined/i.test(message)
  ) {
    return new AppError('unknown', error);
  }

  return new AppError('unknown', error);
}

/** i18n key prefix for StateMessage: `errors.<code>.title` / `.message` */
export const errorTitleKey = (code: AppErrorCode) =>
  `errors.${code}.title` as const;

export const errorMessageKey = (code: AppErrorCode) =>
  `errors.${code}.message` as const;
