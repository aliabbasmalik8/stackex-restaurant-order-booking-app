import type { Order, OrderStatus } from './types'

/** Kitchen-queue orders (paid / cash). Excludes unpaid drafts. */
export const ACTIVE_ORDER_STATUSES: readonly OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
] as const

export const PAST_ORDER_STATUSES: readonly OrderStatus[] = [
  'completed',
  'cancelled',
] as const

export type StatusAction = {
  to: OrderStatus
  /** i18n key under orders.actions.* */
  labelKey: string
  variant: 'primary' | 'secondary' | 'danger'
}

/** Next primary actions from a given status. */
export function nextStatusActions(status: OrderStatus): StatusAction[] {
  switch (status) {
    case 'pending':
      return [
        { to: 'confirmed', labelKey: 'orders.actions.confirm', variant: 'primary' },
        { to: 'cancelled', labelKey: 'orders.actions.cancel', variant: 'danger' },
      ]
    case 'confirmed':
      return [
        {
          to: 'preparing',
          labelKey: 'orders.actions.startPreparing',
          variant: 'primary',
        },
        { to: 'cancelled', labelKey: 'orders.actions.cancel', variant: 'danger' },
      ]
    case 'preparing':
      return [
        { to: 'ready', labelKey: 'orders.actions.markReady', variant: 'primary' },
        { to: 'cancelled', labelKey: 'orders.actions.cancel', variant: 'danger' },
      ]
    case 'ready':
      return [
        {
          to: 'completed',
          labelKey: 'orders.actions.complete',
          variant: 'primary',
        },
      ]
    default:
      return []
  }
}

export function isActiveOrderStatus(status: OrderStatus): boolean {
  return (ACTIVE_ORDER_STATUSES as readonly string[]).includes(status)
}

export function isUnpaidCardOrder(order: Order): boolean {
  return order.paymentMethod === 'card' && order.paymentStatus === 'unpaid'
}

/** Incomplete card checkout (draft + unpaid). */
export function isAwaitingPayment(order: Order): boolean {
  return isUnpaidCardOrder(order)
}

export function isFailedPayment(order: Order): boolean {
  return order.paymentStatus === 'failed'
}

export function isDraftOrder(order: Order): boolean {
  return order.status === 'draft'
}

/** Card was paid but kitchen later cancelled — needs ops attention. */
export function isPaidButCancelled(order: Order): boolean {
  return order.status === 'cancelled' && order.paymentStatus === 'paid'
}

export function isPaidOrder(order: Order): boolean {
  return (
    order.paymentStatus === 'paid' || order.paymentStatus === 'not_required'
  )
}

export function needsPaymentAttention(order: Order): boolean {
  return (
    isDraftOrder(order) ||
    isUnpaidCardOrder(order) ||
    isFailedPayment(order) ||
    order.paymentStatus === 'cancelled'
  )
}
