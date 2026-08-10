import { orderBookingApiClient } from '@/api/OrderBooking/client';
import type { OrderDto, UpdateOrderStatusDto } from './orders.types';

export const ordersApi = {
  getManage: (): Promise<OrderDto[]> =>
    orderBookingApiClient.get<OrderDto[]>('/orders/manage'),

  updateStatus: (
    id: string,
    data: UpdateOrderStatusDto,
  ): Promise<OrderDto> =>
    orderBookingApiClient.patch<OrderDto>(`/orders/${id}/status`, data),
};
