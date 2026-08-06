/** Address fields stored flat on `users/{uid}` (not a nested map). */
export type UserAddress = {
  line1: string;
  line2?: string;
  area?: string;
  city: string;
  notes?: string;
};

/**
 * Firestore `users/{uid}` — contact + address only.
 *
 * - email / displayName → Firebase Auth only
 * - contactPhone → here
 * - address → flat fields (line1, city, …) on this same doc
 */
export type UserProfileDoc = {
  uid: string;
  contactPhone: string | null;
  address: UserAddress | null;
  createdAt: string;
  updatedAt: string;
};

export type SaveUserProfileInput = {
  /** Written to Auth via `updateProfile`, not Firestore. */
  displayName?: string;
  contactPhone?: string | null;
  address?: UserAddress | null;
};

export function emptyAddress(): UserAddress {
  return { line1: '', city: '' };
}

export function formatAddress(address: UserAddress | null | undefined): string {
  if (!address) return '';
  const parts = [
    address.line1?.trim(),
    address.line2?.trim(),
    address.area?.trim(),
    address.city?.trim(),
  ].filter(Boolean);
  return parts.join(', ');
}

export function hasAddress(address: UserAddress | null | undefined): boolean {
  return Boolean(address?.line1?.trim() && address?.city?.trim());
}
