/** Auth-specific error codes → i18n under `auth.errors.<code>`. */
export type AuthErrorCode =
  | 'invalid_credential'
  | 'email_in_use'
  | 'weak_password'
  | 'invalid_email'
  | 'too_many_requests'
  | 'network'
  | 'config_missing'
  | 'unknown';

export class AuthError extends Error {
  readonly code: AuthErrorCode;
  readonly cause?: unknown;

  constructor(code: AuthErrorCode, cause?: unknown) {
    super(code);
    this.name = 'AuthError';
    this.code = code;
    this.cause = cause;
  }
}

export function toAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) return error;

  const status =
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number'
      ? (error as { status: number }).status
      : 0;

  const message =
    error instanceof Error ? error.message : String(error ?? '');

  if (status === 401 || /invalid email or password/i.test(message)) {
    return new AuthError('invalid_credential', error);
  }
  if (status === 409 || /already exists/i.test(message)) {
    return new AuthError('email_in_use', error);
  }
  if (/weak|minLength|password.*6/i.test(message)) {
    return new AuthError('weak_password', error);
  }
  if (status === 400 && /email/i.test(message)) {
    return new AuthError('invalid_email', error);
  }
  if (
    status === 0 ||
    /network|offline|failed to fetch|ECONNREFUSED/i.test(message)
  ) {
    return new AuthError('network', error);
  }
  if (/EXPO_PUBLIC_API_URL|not configured/i.test(message)) {
    return new AuthError('config_missing', error);
  }

  return new AuthError('unknown', error);
}

export const authErrorMessageKey = (code: AuthErrorCode) =>
  `auth.errors.${code}` as const;
