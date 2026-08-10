import { orderBookingApiClient } from '@/api/OrderBooking/client';
import type { CategoryDto, UpsertCategoryDto } from './categories.types';

export const categoriesApi = {
  getAll: (): Promise<CategoryDto[]> =>
    orderBookingApiClient.get<CategoryDto[]>('/categories'),

  getById: (id: string): Promise<CategoryDto> =>
    orderBookingApiClient.get<CategoryDto>(`/categories/${id}`),

  create: (data: UpsertCategoryDto): Promise<CategoryDto> =>
    orderBookingApiClient.post<CategoryDto>('/categories', data),

  update: (id: string, data: UpsertCategoryDto): Promise<CategoryDto> =>
    orderBookingApiClient.patch<CategoryDto>(`/categories/${id}`, data),

  remove: (id: string): Promise<void> =>
    orderBookingApiClient.delete<void>(`/categories/${id}`),
};
