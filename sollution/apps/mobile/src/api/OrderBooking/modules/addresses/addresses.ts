import { orderBookingApiClient } from '@/api/OrderBooking/client';
import type { UserAddressDto } from './addresses.types';

export const addressesApi = {
  list: (): Promise<UserAddressDto[]> =>
    orderBookingApiClient.get<UserAddressDto[]>('/addresses'),
};
