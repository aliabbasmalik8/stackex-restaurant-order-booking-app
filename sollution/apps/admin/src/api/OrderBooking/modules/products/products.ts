import { orderBookingApiClient } from '@/api/OrderBooking/client';
import type { ProductDto, UpsertProductDto } from './products.types';

export const productsApi = {
  /** Admin list (includes unavailable). */
  getManage: (): Promise<ProductDto[]> =>
    orderBookingApiClient.get<ProductDto[]>('/products/manage'),

  getById: (id: string): Promise<ProductDto> =>
    orderBookingApiClient.get<ProductDto>(`/products/${id}`),

  create: (data: UpsertProductDto): Promise<ProductDto> =>
    orderBookingApiClient.post<ProductDto>('/products', data),

  update: (id: string, data: UpsertProductDto): Promise<ProductDto> =>
    orderBookingApiClient.patch<ProductDto>(`/products/${id}`, data),

  remove: (id: string): Promise<void> =>
    orderBookingApiClient.delete<void>(`/products/${id}`),
};
