import { orderBookingApiClient } from '@/api/OrderBooking/client';
import type { ProductDto } from './products.types';

export const productsApi = {
  getAll: (branchId?: string): Promise<ProductDto[]> => {
    const query = branchId
      ? `?branchId=${encodeURIComponent(branchId)}`
      : '';
    return orderBookingApiClient.get<ProductDto[]>(`/products${query}`);
  },

  getById: (id: string): Promise<ProductDto> =>
    orderBookingApiClient.get<ProductDto>(`/products/${id}`),
};
