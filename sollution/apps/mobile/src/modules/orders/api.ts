import { ordersApi } from '@/api/OrderBooking/modules/orders';
import type { CreateOrderDto } from '@/api/OrderBooking/modules/orders';
import { toAppError } from '@/lib/errors';
import type { Order } from './types';

/** Owner-scoped list (auth token); newest-first from API. */
export async function fetchOrdersForUser(_userId?: string): Promise<Order[]> {
  try {
    return await ordersApi.getMine();
  } catch (error) {
    throw toAppError(error);
  }
}

export async function createOrder(input: CreateOrderDto): Promise<Order> {
  try {
    return await ordersApi.create(input);
  } catch (error) {
    if (__DEV__) {
      console.warn('[orders] createOrder failed', error);
    }
    throw toAppError(error);
  }
}
