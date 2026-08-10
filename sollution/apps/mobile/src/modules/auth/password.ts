import { ApiError } from '@/api/OrderBooking/client';
import { userApi } from '@/api/OrderBooking/modules/user';
import {
  clearAuthSession,
  setAuthSession,
} from '@/utils/auth/session';
import { toAuthError } from './errors';
import type { AuthUser } from './profile';
import { authUserFromProfile } from './profile';

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthUser> {
  try {
    const response = await userApi.login({
      email: email.trim(),
      password,
    });
    await setAuthSession({
      token: response.token,
      refreshToken: response.refreshToken,
    });
    return authUserFromProfile(response.user);
  } catch (error) {
    throw toAuthError(error);
  }
}

export async function signUpWithPassword(input: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<AuthUser> {
  try {
    const response = await userApi.signup({
      email: input.email.trim(),
      password: input.password,
      name: input.displayName?.trim(),
    });
    await setAuthSession({
      token: response.token,
      refreshToken: response.refreshToken,
    });
    return authUserFromProfile(response.user);
  } catch (error) {
    throw toAuthError(error);
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await clearAuthSession();
  } catch (error) {
    throw toAuthError(error);
  }
}

export function isApiAuthError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
