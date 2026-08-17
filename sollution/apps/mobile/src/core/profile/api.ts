import { userApi } from '@/api/OrderBooking/modules/user';
import { toAppError } from '@/lib/errors';
import type { SaveUserProfileInput, UserProfileDoc } from './types';

function toDoc(profile: {
  id: string;
  contactPhone: string | null;
  created_at: string | Date;
}): UserProfileDoc {
  return {
    uid: profile.id,
    contactPhone: profile.contactPhone,
    createdAt:
      typeof profile.created_at === 'string'
        ? profile.created_at
        : profile.created_at.toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchUserProfile(
  _uid?: string,
): Promise<UserProfileDoc | null> {
  try {
    const profile = await userApi.getProfile();
    return toDoc(profile);
  } catch (error) {
    throw toAppError(error);
  }
}

/** Update Nest user profile (name / contactPhone). */
export async function saveUserProfile(
  _uid: string,
  input: SaveUserProfileInput,
): Promise<UserProfileDoc> {
  try {
    const saved = await userApi.updateProfile({
      name: input.displayName,
      contactPhone: input.contactPhone,
    });
    return toDoc(saved);
  } catch (error) {
    if (__DEV__) console.warn('[profile] saveUserProfile failed', error);
    throw toAppError(error);
  }
}
