import { orderBookingApiClient } from '@/api/OrderBooking/client';
import type {
  AuthResponse,
  FirebaseLoginDto,
  LoginUserDto,
  SignupUserDto,
} from './auth.types';

export const authApi = {
  /**
   * @deprecated Nest-local signup. Mobile uses Firebase + `loginWithFirebase`.
   * Will be removed.
   */
  signup: (data: SignupUserDto): Promise<AuthResponse> =>
    orderBookingApiClient.post<AuthResponse>('/auth/signup', data, {
      skipAuth: true,
    }),

  /**
   * @deprecated Nest-local password login. Mobile uses Firebase + `loginWithFirebase`.
   * Will be removed.
   */
  login: (data: LoginUserDto): Promise<AuthResponse> =>
    orderBookingApiClient.post<AuthResponse>('/auth/login', data, {
      skipAuth: true,
    }),

  /** Preferred: Firebase ID token → Nest JWT session. */
  loginWithFirebase: (data: FirebaseLoginDto): Promise<AuthResponse> =>
    orderBookingApiClient.post<AuthResponse>('/auth/firebase', data, {
      skipAuth: true,
    }),
};
