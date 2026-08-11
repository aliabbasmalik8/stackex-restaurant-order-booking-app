import type { UserProfile } from '@/api/OrderBooking/modules/user';

export type SignupUserDto = {
  name?: string;
  email: string;
  password: string;
};

export type LoginUserDto = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: UserProfile;
  token: string;
  refreshToken: string;
};

export type SignupResponse = AuthResponse;
export type LoginResponse = AuthResponse;
