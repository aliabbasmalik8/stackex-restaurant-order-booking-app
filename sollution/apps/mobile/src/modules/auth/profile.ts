import type { User } from 'firebase/auth';

/** App-facing profile derived from Firebase Auth (and later Firestore). */
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
  };
}
