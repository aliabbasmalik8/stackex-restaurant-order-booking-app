import type { User } from 'firebase/auth';
import type { UserAddress, UserProfileDoc } from '@/modules/profile';

/** App-facing profile: Auth identity + Firestore `users/{uid}` overlay. */
export type AuthProfile = {
  name: string;
  shortName: string;
  /** Always from Firebase Auth — never a Firestore copy. */
  email: string | null;
  /**
   * Contact phone: Firestore `contactPhone`, else Auth `phoneNumber`
   * (only set when Phone Auth is linked).
   */
  phone: string | null;
  /** Phone if present, otherwise email — for subtitle lines. */
  contact: string | null;
  initial: string;
  address: UserAddress | null;
};

function firstInitial(name: string): string {
  const ch = name.trim().charAt(0);
  return ch ? ch.toUpperCase() : '?';
}

/** "Aisha Khalid" → "Aisha K." */
export function shortDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0]!;
  const last = parts[parts.length - 1]!;
  return `${parts[0]} ${last.charAt(0).toUpperCase()}.`;
}

export function profileFromUser(user: User | null): AuthProfile | null {
  if (!user) return null;

  const email = user.email?.trim() || null;
  const phone = user.phoneNumber?.trim() || null;
  const rawName = user.displayName?.trim();
  const name =
    rawName ||
    (email ? email.split('@')[0]! : null) ||
    'Account';

  return {
    name,
    shortName: shortDisplayName(name) || name,
    email,
    phone,
    contact: phone ?? email,
    initial: firstInitial(name),
    address: null,
  };
}

/**
 * Merge Auth + Firestore.
 * - email: Auth only
 * - name / address / contactPhone: Firestore preferred
 */
export function mergeAuthProfile(
  authProfile: AuthProfile | null,
  doc: UserProfileDoc | null,
): AuthProfile | null {
  if (!authProfile) return null;
  if (!doc) return authProfile;

  const name = doc.displayName.trim() || authProfile.name;
  const phone = doc.contactPhone ?? authProfile.phone;
  const email = authProfile.email;

  return {
    name,
    shortName: shortDisplayName(name) || name,
    email,
    phone,
    contact: phone ?? email,
    initial: firstInitial(name),
    address: doc.address,
  };
}
