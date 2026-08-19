import { orderBookingApiClient } from '@/api/OrderBooking/client'
import type { CreateOrderDto, OrderDto } from './orders.types'

export const ordersApi = {
  getMine: (): Promise<OrderDto[]> =>
    orderBookingApiClient.get<OrderDto[]>('/orders'),

  create: (data: CreateOrderDto): Promise<OrderDto> =>
    orderBookingApiClient.post<OrderDto>('/orders', data),
}
