import type { OrderStatus } from './types'

export const CURRENT_ORDER_STATUSES: readonly OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
] as const

export const PAST_ORDER_STATUSES: readonly OrderStatus[] = [
  'completed',
  'cancelled',
] as const

export function isCurrentOrderStatus(status: OrderStatus): boolean {
  return (CURRENT_ORDER_STATUSES as readonly string[]).includes(status)
}

export function isPastOrderStatus(status: OrderStatus): boolean {
  return (PAST_ORDER_STATUSES as readonly string[]).includes(status)
}
