import { orderBookingApiClient } from '@/api/OrderBooking/client';
import type {
  AuthResponse,
  LoginUserDto,
  SignupUserDto,
} from './auth.types';

export const authApi = {
  signup: (data: SignupUserDto): Promise<AuthResponse> =>
    orderBookingApiClient.post<AuthResponse>('/auth/signup', data, {
      skipAuth: true,
    }),

  login: (data: LoginUserDto): Promise<AuthResponse> =>
    orderBookingApiClient.post<AuthResponse>('/auth/login', data, {
      skipAuth: true,
    }),
};
