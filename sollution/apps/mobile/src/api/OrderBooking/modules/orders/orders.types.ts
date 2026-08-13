import type { CreateOrderInput, Order } from '@/core/orders/types';

export type OrderDto = Order;

/** Body for POST /orders — server sets userId + orderCode. */
export type CreateOrderDto = Omit<
  CreateOrderInput,
  'userId' | 'createdAt' | 'updatedAt'
>;
