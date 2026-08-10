import { orderBookingApiClient } from '@/api/OrderBooking/client';
import type { AuthResponse, LoginUserDto, UserProfile } from './user.types';

export const userApi = {
  login: (data: LoginUserDto): Promise<AuthResponse> =>
    orderBookingApiClient.post<AuthResponse>('/users/login', data, {
      skipAuth: true,
    }),

  getProfile: (): Promise<UserProfile> =>
    orderBookingApiClient.get<UserProfile>('/users/me'),
};
