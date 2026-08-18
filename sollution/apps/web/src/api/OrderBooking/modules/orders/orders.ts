import { orderBookingApiClient } from '@/api/OrderBooking/client'
import type { OrderDto } from './orders.types'

export const ordersApi = {
  getMine: (): Promise<OrderDto[]> =>
    orderBookingApiClient.get<OrderDto[]>('/orders'),
}
