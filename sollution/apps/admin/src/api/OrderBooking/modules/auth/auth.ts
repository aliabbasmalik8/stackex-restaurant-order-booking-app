import { orderBookingApiClient } from '@/api/OrderBooking/client';
import type { AuthResponse, LoginUserDto } from './auth.types';

export const authApi = {
  login: (data: LoginUserDto): Promise<AuthResponse> =>
    orderBookingApiClient.post<AuthResponse>('/auth/login', data, {
      skipAuth: true,
    }),
};
