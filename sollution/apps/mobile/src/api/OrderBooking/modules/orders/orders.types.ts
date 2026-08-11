import type { CreateOrderInput, Order } from '@/core/orders/types';

export type OrderDto = Order;

/** Body for POST /orders — server sets userId from the auth token. */
export type CreateOrderDto = Omit<
  CreateOrderInput,
  'userId' | 'createdAt' | 'updatedAt'
>;
