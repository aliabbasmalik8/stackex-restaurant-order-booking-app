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

function mapAddressFromDoc(data: Record<string, unknown>): UserAddress | null {
  // Nested `address` map (legacy) or flat fields on the user doc.
  if (data.address && typeof data.address === 'object') {
    const a = data.address as Record<string, unknown>;
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

  const line1 = typeof data.line1 === 'string' ? data.line1 : '';
  const city = typeof data.city === 'string' ? data.city : '';
  if (!line1 && !city) return null;
  return {
    line1,
    line2: typeof data.line2 === 'string' ? data.line2 : undefined,
    area: typeof data.area === 'string' ? data.area : undefined,
    city,
    notes: typeof data.notes === 'string' ? data.notes : undefined,
  };
}

function mapDoc(uid: string, data: Record<string, unknown>): UserProfileDoc {
  const contactRaw =
    typeof data.contactPhone === 'string'
      ? data.contactPhone
      : typeof data.phone === 'string'
        ? data.phone
        : null;

  return {
    uid,
    contactPhone: contactRaw?.trim() || null,
    address: mapAddressFromDoc(data),
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
 * Upsert Firestore `users/{uid}` (contactPhone + address).
 * Optional `displayName` updates Auth only — never written to Firestore.
 */
export async function saveUserProfile(
  uid: string,
  input: SaveUserProfileInput,
): Promise<UserProfileDoc> {
  try {
    const now = new Date().toISOString();
    const existing = await fetchUserProfile(uid);

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

    // Persist address as flat fields (matches config addressFields).
    const payload = stripUndefinedDeep({
      contactPhone,
      line1: address?.line1 ?? null,
      line2: address?.line2 ?? null,
      area: address?.area ?? null,
      city: address?.city ?? null,
      notes: address?.notes ?? null,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    });

    await setDoc(doc(getDb(), COLLECTIONS.users, uid), payload, {
      merge: true,
    });

    const displayName = input.displayName?.trim();
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
