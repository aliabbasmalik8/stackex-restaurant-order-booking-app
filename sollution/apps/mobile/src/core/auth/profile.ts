import type { UserProfile } from '@/api/OrderBooking/modules/user';
import type { UserProfileDoc } from '@/core/profile';

/**
 * Auth identity from Nest JWT session.
 */
export type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
};

/** App-facing profile: Nest user + contact. */
export type AuthProfile = {
  name: string;
  shortName: string;
  email: string | null;
  phone: string | null;
  /** Phone if present, otherwise email — for subtitle lines. */
  contact: string | null;
  initial: string;
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

export function profileFromUser(user: AuthUser | null): AuthProfile | null {
  if (!user) return null;

  const email = user.email?.trim() || null;
  const rawName = user.name?.trim();
  const name =
    rawName || (email ? email.split('@')[0]! : null) || 'Account';

  return {
    name,
    shortName: shortDisplayName(name) || name,
    email,
    phone: null,
    contact: email,
    initial: firstInitial(name),
  };
}

export function profileFromApiUser(user: UserProfile): AuthProfile {
  const email = user.email?.trim() || null;
  const rawName = user.name?.trim();
  const name =
    rawName || (email ? email.split('@')[0]! : null) || 'Account';
  const phone = user.contactPhone?.trim() || null;

  return {
    name,
    shortName: shortDisplayName(name) || name,
    email,
    phone,
    contact: phone ?? email,
    initial: firstInitial(name),
  };
}

export function authUserFromProfile(user: UserProfile): AuthUser {
  return {
    id: user.id,
    email: user.email?.trim() || null,
    name: user.name?.trim() || null,
  };
}

/**
 * Merge identity + profile overlay.
 */
export function mergeAuthProfile(
  authProfile: AuthProfile | null,
  doc: UserProfileDoc | null,
): AuthProfile | null {
  if (!authProfile) return null;
  if (!doc) return authProfile;

  const phone = doc.contactPhone ?? authProfile.phone;
  const email = authProfile.email;

  return {
    ...authProfile,
    phone,
    contact: phone ?? email,
  };
}
