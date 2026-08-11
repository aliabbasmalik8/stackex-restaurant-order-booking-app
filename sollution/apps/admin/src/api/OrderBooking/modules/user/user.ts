import { orderBookingApiClient } from '@/api/OrderBooking/client';
import type { UserProfile } from './user.types';

export const userApi = {
  getProfile: (): Promise<UserProfile> =>
    orderBookingApiClient.get<UserProfile>('/users/me'),
};
