import { orderBookingApiClient } from '@/api/OrderBooking/client'
import type { UpdateProfileDto, UserProfile } from './user.types'

export const userApi = {
  getProfile: (): Promise<UserProfile> =>
    orderBookingApiClient.get<UserProfile>('/users/me'),

  updateProfile: (data: UpdateProfileDto): Promise<UserProfile> =>
    orderBookingApiClient.patch<UserProfile>('/users/me', data),
}
