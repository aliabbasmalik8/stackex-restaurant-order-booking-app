import { ApiError } from '@/api/OrderBooking/client';
import { userApi } from '@/api/OrderBooking/modules/user';
import {
  clearAuthSession,
  setAuthSession,
} from '@/utils/auth/session';
import { AuthError, toAuthError } from './errors';
import type { UserProfile } from '@/api/OrderBooking/modules/user';

export type AdminUser = {
  id: string;
  email: string | null;
  name: string | null;
  is_super_admin: boolean;
};

export function toAdminUser(profile: UserProfile): AdminUser {
  return {
    id: profile.id,
    email: profile.email?.trim() || null,
    name: profile.name?.trim() || null,
    is_super_admin: Boolean(profile.is_super_admin),
  };
}

/**
 * Email/password sign-in. Rejects if the user is not a super admin.
 */
export async function signInAdmin(
  email: string,
  password: string,
): Promise<AdminUser> {
  try {
    const response = await userApi.login({
      email: email.trim(),
      password,
    });
    if (!response.user.is_super_admin) {
      clearAuthSession();
      throw new AuthError('not_admin');
    }
    setAuthSession({
      token: response.token,
      refreshToken: response.refreshToken,
    });
    return toAdminUser(response.user);
  } catch (error) {
    if (error instanceof AuthError) throw error;
    if (error instanceof ApiError && error.status === 403) {
      throw new AuthError('not_admin', error);
    }
    throw toAuthError(error);
  }
}

export async function signOutAdmin(): Promise<void> {
  try {
    clearAuthSession();
  } catch (error) {
    throw toAuthError(error);
  }
}

export async function fetchAdminProfile(): Promise<AdminUser> {
  try {
    const profile = await userApi.getProfile();
    if (!profile.is_super_admin) {
      clearAuthSession();
      throw new AuthError('not_admin');
    }
    return toAdminUser(profile);
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw toAuthError(error);
  }
}
