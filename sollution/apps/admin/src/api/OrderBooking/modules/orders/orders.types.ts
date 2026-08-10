import type { Order, OrderStatus } from '@/modules/orders/types';

export type OrderDto = Order;

export type UpdateOrderStatusDto = {
  status: OrderStatus;
};
