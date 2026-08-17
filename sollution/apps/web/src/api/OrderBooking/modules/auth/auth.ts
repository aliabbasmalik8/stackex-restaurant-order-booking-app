import { orderBookingApiClient } from '@/api/OrderBooking/client'
import type {
  AuthResponse,
  EmailAuthStatusDto,
  EmailAuthStatusResponse,
  FirebaseLoginDto,
  LoginUserDto,
  SignupUserDto,
} from './auth.types'

export const authApi = {
  /**
   * @deprecated Nest-local signup. Guest app uses Firebase + `loginWithFirebase`.
   */
  signup: (data: SignupUserDto): Promise<AuthResponse> =>
    orderBookingApiClient.post<AuthResponse>('/auth/signup', data, {
      skipAuth: true,
    }),

  /**
   * @deprecated Nest-local password login. Guest app uses Firebase + `loginWithFirebase`.
   */
  login: (data: LoginUserDto): Promise<AuthResponse> =>
    orderBookingApiClient.post<AuthResponse>('/auth/login', data, {
      skipAuth: true,
    }),

  loginWithFirebase: (data: FirebaseLoginDto): Promise<AuthResponse> =>
    orderBookingApiClient.post<AuthResponse>('/auth/firebase', data, {
      skipAuth: true,
    }),

  lookupEmailStatus: (
    data: EmailAuthStatusDto,
  ): Promise<EmailAuthStatusResponse> =>
    orderBookingApiClient.post<EmailAuthStatusResponse>(
      '/auth/email-status',
      data,
      { skipAuth: true },
    ),
}
