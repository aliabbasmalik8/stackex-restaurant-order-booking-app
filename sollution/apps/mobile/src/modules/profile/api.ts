import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { getDb, getFirebaseAuth } from '@/lib/firebase';
import { toAppError } from '@/lib/errors';
import { COLLECTIONS } from '@/modules/catalog/constants';
import type {
  SaveUserProfileInput,
  UserAddress,
  UserProfileDoc,
} from './types';

function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)) as T;
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(
      value as Record<string, unknown>,
    )) {
      if (nested === undefined) continue;
      out[key] = stripUndefinedDeep(nested);
    }
    return out as T;
  }
  return value;
}

function mapAddress(raw: unknown): UserAddress | null {
  if (!raw || typeof raw !== 'object') return null;
  const a = raw as Record<string, unknown>;
  const line1 = typeof a.line1 === 'string' ? a.line1 : '';
  const city = typeof a.city === 'string' ? a.city : '';
  if (!line1 && !city) return null;
  return {
    line1,
    line2: typeof a.line2 === 'string' ? a.line2 : undefined,
    area: typeof a.area === 'string' ? a.area : undefined,
    city,
    notes: typeof a.notes === 'string' ? a.notes : undefined,
  };
}

function mapDoc(uid: string, data: Record<string, unknown>): UserProfileDoc {
  // Prefer contactPhone; accept legacy `phone` if an older doc exists.
  const contactRaw =
    typeof data.contactPhone === 'string'
      ? data.contactPhone
      : typeof data.phone === 'string'
        ? data.phone
        : null;

  return {
    uid,
    displayName:
      typeof data.displayName === 'string' ? data.displayName.trim() : '',
    contactPhone: contactRaw?.trim() || null,
    address: mapAddress(data.address),
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : '',
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : '',
  };
}

export async function fetchUserProfile(
  uid: string,
): Promise<UserProfileDoc | null> {
  try {
    const snap = await getDoc(doc(getDb(), COLLECTIONS.users, uid));
    if (!snap.exists()) return null;
    return mapDoc(uid, snap.data() as Record<string, unknown>);
  } catch (error) {
    throw toAppError(error);
  }
}

/**
 * Upsert `users/{uid}` and mirror `displayName` onto Firebase Auth.
 * Does not write email (Auth-only).
 */
export async function saveUserProfile(
  uid: string,
  input: SaveUserProfileInput,
): Promise<UserProfileDoc> {
  try {
    const now = new Date().toISOString();
    const existing = await fetchUserProfile(uid);
    const displayName = input.displayName.trim();
    const contactPhone =
      input.contactPhone === undefined
        ? (existing?.contactPhone ?? null)
        : input.contactPhone?.trim() || null;

    let address: UserAddress | null;
    if (input.address === undefined) {
      address = existing?.address ?? null;
    } else if (input.address === null) {
      address = null;
    } else {
      const cleaned: UserAddress = {
        line1: input.address.line1.trim(),
        city: input.address.city.trim(),
      };
      const line2 = input.address.line2?.trim();
      const area = input.address.area?.trim();
      const notes = input.address.notes?.trim();
      if (line2) cleaned.line2 = line2;
      if (area) cleaned.area = area;
      if (notes) cleaned.notes = notes;
      address = cleaned.line1 || cleaned.city ? cleaned : null;
    }

    const payload = stripUndefinedDeep({
      displayName,
      contactPhone,
      address,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    });

    await setDoc(doc(getDb(), COLLECTIONS.users, uid), payload, {
      merge: true,
    });

    const auth = getFirebaseAuth();
    if (auth.currentUser && auth.currentUser.uid === uid && displayName) {
      await updateProfile(auth.currentUser, { displayName });
      await auth.currentUser.reload();
    }

    return mapDoc(uid, payload as Record<string, unknown>);
  } catch (error) {
    if (__DEV__) console.warn('[profile] saveUserProfile failed', error);
    throw toAppError(error);
  }
}
