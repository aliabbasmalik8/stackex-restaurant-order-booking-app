/** Address fields stored flat on `users/{uid}` (not a nested map). */
export type UserAddress = {
  line1: string;
  line2?: string;
  area?: string;
  city: string;
  notes?: string;
};

/**
 * Nest user profile overlay — contact + address.
 *
 * - email / name → user table columns
 * - contactPhone / address → same row
 */
export type UserProfileDoc = {
  uid: string;
  contactPhone: string | null;
  address: UserAddress | null;
  createdAt: string;
  updatedAt: string;
};

export type SaveUserProfileInput = {
  /** Maps to user.name */
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
