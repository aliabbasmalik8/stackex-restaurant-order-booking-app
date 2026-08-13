import { orderBookingApiClient } from '@/api/OrderBooking/client';
import type { ProductDto } from './products.types';

export const productsApi = {
  getAll: (): Promise<ProductDto[]> =>
    orderBookingApiClient.get<ProductDto[]>('/products'),

  getById: (id: string): Promise<ProductDto> =>
    orderBookingApiClient.get<ProductDto>(`/products/${id}`),
};
