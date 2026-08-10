import { orderBookingApiClient } from '@/api/OrderBooking/client';
import type {
  AuthResponse,
  LoginUserDto,
  SignupUserDto,
  UpdateProfileDto,
  UserProfile,
} from './user.types';

export const userApi = {
  signup: (data: SignupUserDto): Promise<AuthResponse> =>
    orderBookingApiClient.post<AuthResponse>('/users/signup', data, {
      skipAuth: true,
    }),

  login: (data: LoginUserDto): Promise<AuthResponse> =>
    orderBookingApiClient.post<AuthResponse>('/users/login', data, {
      skipAuth: true,
    }),

  getProfile: (): Promise<UserProfile> =>
    orderBookingApiClient.get<UserProfile>('/users/me'),

  updateProfile: (data: UpdateProfileDto): Promise<UserProfile> =>
    orderBookingApiClient.patch<UserProfile>('/users/me', data),
};
