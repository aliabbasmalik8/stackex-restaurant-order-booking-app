import { orderBookingApiClient } from '@/api/OrderBooking/client'
import type { CategoryDto } from './categories.types'

export const categoriesApi = {
  getAll: (): Promise<CategoryDto[]> =>
    orderBookingApiClient.get<CategoryDto[]>('/categories'),
}
