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
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found' ||
    code === 'auth/invalid-login-credentials'
  ) {
    return new AuthError('invalid_credential', error);
  }
  if (code === 'auth/email-already-in-use') {
    return new AuthError('email_in_use', error);
  }
  if (code === 'auth/weak-password') {
    return new AuthError('weak_password', error);
  }
  if (code === 'auth/invalid-email') {
    return new AuthError('invalid_email', error);
  }
  if (code === 'auth/too-many-requests') {
    return new AuthError('too_many_requests', error);
  }
  if (
    code === 'auth/network-request-failed' ||
    /network|offline|failed to fetch/i.test(message)
  ) {
    return new AuthError('network', error);
  }
  if (/not configured|EXPO_PUBLIC_FIREBASE|\.env/i.test(message)) {
    return new AuthError('config_missing', error);
  }

  return new AuthError('unknown', error);
}

export const authErrorMessageKey = (code: AuthErrorCode) =>
  `auth.errors.${code}` as const;
