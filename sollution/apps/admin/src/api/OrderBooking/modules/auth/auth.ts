import { orderBookingApiClient } from '@/api/OrderBooking/client';
import type { AuthResponse, LoginUserDto } from './auth.types';

export const authApi = {
  /**
   * @deprecated Nest-local password login. Prefer Firebase Auth + `/auth/firebase`
   * when admin moves off Nest password. Will be removed.
   */
  login: (data: LoginUserDto): Promise<AuthResponse> =>
    orderBookingApiClient.post<AuthResponse>('/auth/login', data, {
      skipAuth: true,
    }),
};
