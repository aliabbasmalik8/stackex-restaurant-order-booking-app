import { orderBookingApiClient } from '@/api/OrderBooking/client';
import type {
  CreateAddressRequest,
  ReverseGeocodeRequest,
  ReverseGeocodeResult,
  UpdateAddressRequest,
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

  create: (body: CreateAddressRequest): Promise<UserAddressDto> =>
    orderBookingApiClient.post<UserAddressDto>('/addresses', body),

  setDefault: (id: string): Promise<UserAddressDto> =>
    orderBookingApiClient.patch<UserAddressDto>(`/addresses/${id}/default`),

  update: (id: string, body: UpdateAddressRequest): Promise<UserAddressDto> =>
    orderBookingApiClient.patch<UserAddressDto>(`/addresses/${id}`, body),

  remove: (id: string): Promise<void> =>
    orderBookingApiClient.delete<void>(`/addresses/${id}`),
};
