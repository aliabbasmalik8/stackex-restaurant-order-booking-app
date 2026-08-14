/** Auth-specific error codes → i18n under `auth.errors.<code>`. */
export type AuthErrorCode =
  | 'invalid_credential'
  | 'email_in_use'
  | 'weak_password'
  | 'invalid_email'
  | 'too_many_requests'
  | 'network'
  | 'config_missing'
  | 'expo_go'
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

function firebaseAuthCode(error: unknown): string | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  ) {
    return (error as { code: string }).code;
  }
  return null;
}

export function toAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) return error;

  const firebaseCode = firebaseAuthCode(error);
  if (firebaseCode) {
    switch (firebaseCode) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-login-credentials':
        return new AuthError('invalid_credential', error);
      case 'auth/email-already-in-use':
        return new AuthError('email_in_use', error);
      case 'auth/weak-password':
        return new AuthError('weak_password', error);
      case 'auth/invalid-email':
        return new AuthError('invalid_email', error);
      case 'auth/too-many-requests':
        return new AuthError('too_many_requests', error);
      case 'auth/network-request-failed':
        return new AuthError('network', error);
      case 'auth/operation-not-allowed':
      case 'auth/configuration-not-found':
        return new AuthError('config_missing', error);
      default:
        break;
    }
  }

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
  if (
    /EXPO_PUBLIC_API_URL|EXPO_PUBLIC_FIREBASE_|not configured/i.test(message)
  ) {
    return new AuthError('config_missing', error);
  }

  return new AuthError('unknown', error);
}

export const authErrorMessageKey = (code: AuthErrorCode) =>
  `auth.errors.${code}` as const;
