export type AppErrorCode =
  | 'config_missing'
  | 'network'
  | 'permission'
  | 'not_found'
  | 'empty'
  | 'store_closed'
  | 'item_unavailable'
  | 'branch_unavailable'
  | 'unknown';

/** Machine-readable error; UI maps `code` → i18n, never shows raw messages. */
export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly cause?: unknown;
  /** Menu item ids rejected at checkout (86 / missing / wrong branch). */
  readonly unavailableMenuItemIds?: string[];

  constructor(
    code: AppErrorCode,
    cause?: unknown,
    unavailableMenuItemIds?: string[],
  ) {
    super(code);
    this.name = 'AppError';
    this.code = code;
    this.cause = cause;
    this.unavailableMenuItemIds = unavailableMenuItemIds;
  }
}

const SETUP_HINT =
  'API is not reachable. Set EXPO_PUBLIC_API_URL in apps/mobile/.env (e.g. http://localhost:8000).';

function readApiPayload(error: unknown): {
  status: number;
  message: string;
  code?: string;
  unavailableMenuItemIds?: string[];
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

  return { status, message, code, unavailableMenuItemIds };
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  const { status, message, code, unavailableMenuItemIds } =
    readApiPayload(error);

  if (code === 'ITEM_UNAVAILABLE') {
    return new AppError('item_unavailable', error, unavailableMenuItemIds);
  }
  if (code === 'BRANCH_UNAVAILABLE') {
    return new AppError('branch_unavailable', error);
  }

  if (
    status === 0 ||
    /network|offline|failed to fetch|ECONNREFUSED/i.test(message)
  ) {
    return new AppError('network', error);
  }

  if (status === 503 || /store is currently unavailable|closed/i.test(message)) {
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

  if (
    status === 400 &&
    /no longer available|item.*unavailable|sold.?out/i.test(message)
  ) {
    return new AppError('item_unavailable', error, unavailableMenuItemIds);
  }

  return new AppError('unknown', error);
}

/** i18n key prefix for StateMessage: `errors.<code>.title` / `.message` */
export const errorTitleKey = (code: AppErrorCode) =>
  `errors.${code}.title` as const;

export const errorMessageKey = (code: AppErrorCode) =>
  `errors.${code}.message` as const;
