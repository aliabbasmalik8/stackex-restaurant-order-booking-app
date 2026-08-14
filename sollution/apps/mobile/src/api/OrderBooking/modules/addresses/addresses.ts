import { orderBookingApiClient } from '@/api/OrderBooking/client';
import type {
  ReverseGeocodeRequest,
  ReverseGeocodeResult,
  UserAddressDto,
} from './addresses.types';

export const addressesApi = {
  list: (): Promise<UserAddressDto[]> =>
    orderBookingApiClient.get<UserAddressDto[]>('/addresses'),

  reverseGeocode: (
    body: ReverseGeocodeRequest,
  ): Promise<ReverseGeocodeResult> =>
    orderBookingApiClient.post<ReverseGeocodeResult>(
      '/addresses/reverse-geocode',
      body,
    ),
};
