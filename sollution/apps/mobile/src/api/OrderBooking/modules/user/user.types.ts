import type { UserAddress } from '@/modules/profile';

export type SignupUserDto = {
  name?: string;
  email: string;
  password: string;
};

export type LoginUserDto = {
  email: string;
  password: string;
};

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

export type AuthResponse = {
  user: UserProfile;
  token: string;
  refreshToken: string;
};

export type SignupResponse = AuthResponse;
export type LoginResponse = AuthResponse;
