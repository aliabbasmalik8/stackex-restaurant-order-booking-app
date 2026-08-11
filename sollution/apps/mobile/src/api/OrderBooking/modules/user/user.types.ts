import type { UserAddress } from '@/core/profile';

export type UpdateProfileDto = {
  name?: string;
  contactPhone?: string | null;
  address?: UserAddress | null;
};

export type UserProfile = {
  id: string;
  name?: string;
  email?: string;
  contactPhone: string | null;
  address: UserAddress | null;
  is_super_admin: boolean;
  is_active: boolean;
  created_at: string;
};
