import type { UserProfile } from '@/api/OrderBooking/modules/user';

/**
 * @deprecated Nest-local signup DTO. Prefer Firebase + `FirebaseLoginDto`.
 * Will be removed.
 */
export type SignupUserDto = {
  name?: string;
  email: string;
  password: string;
};

/**
 * @deprecated Nest-local login DTO. Prefer Firebase + `FirebaseLoginDto`.
 * Will be removed.
 */
export type LoginUserDto = {
  email: string;
  password: string;
};

export type FirebaseLoginDto = {
  idToken: string;
};

export type EmailAuthStatus = 'ok' | 'account-not-exist' | 'password-reset-required';

export type EmailAuthStatusDto = {
  email: string;
};

export type EmailAuthStatusResponse = {
  status: EmailAuthStatus;
};

export type AuthResponse = {
  user: UserProfile;
  token: string;
  refreshToken: string;
};

/** @deprecated Alias of AuthResponse — Nest password signup path. */
export type SignupResponse = AuthResponse;
/** @deprecated Alias of AuthResponse — Nest password login path. */
export type LoginResponse = AuthResponse;
