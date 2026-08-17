/**
 * @deprecated Nest-local login DTO. Admin still uses `POST /auth/login` temporarily;
 * will move to Firebase. Planned removal.
 */
export type LoginUserDto = {
  email: string;
  password: string;
};

export type UserProfile = {
  id: string;
  name?: string;
  email?: string;
  contactPhone: string | null;
  is_super_admin: boolean;
  is_active: boolean;
  created_at: string;
};

export type AuthResponse = {
  user: UserProfile;
  token: string;
  refreshToken: string;
};
