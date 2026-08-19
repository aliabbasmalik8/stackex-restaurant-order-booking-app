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

export const FULFILLMENT_STEPS = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'completed',
] as const

export const EDITABLE_ORDER_STATUSES: readonly OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'completed',
  'cancelled',
] as const

export type FulfillmentStep = (typeof FULFILLMENT_STEPS)[number]

export type FulfillmentStepTone = 'done' | 'current' | 'upcoming' | 'cancelled'

export type StatusAction = {
  to: OrderStatus
  /** i18n key under orders.actions.* */
  labelKey: string
  variant: 'primary' | 'secondary' | 'danger'
}

export function fulfillmentStepIndex(status: OrderStatus): number {
  return FULFILLMENT_STEPS.indexOf(status as FulfillmentStep)
}

export function fulfillmentStepTone(
  status: OrderStatus,
  step: FulfillmentStep,
): FulfillmentStepTone {
  if (status === 'cancelled' || status === 'draft') return 'cancelled'
  const current = fulfillmentStepIndex(status)
  const index = FULFILLMENT_STEPS.indexOf(step)
  if (current < 0) return 'upcoming'
  if (index < current) return 'done'
  if (index === current) return 'current'
  return 'upcoming'
}

export function isTerminalKitchenStatus(status: OrderStatus): boolean {
  return status === 'completed' || status === 'cancelled' || status === 'draft'
}

/** Later steps only (plus cancel when allowed). Never earlier than `from`. */
export function canMoveKitchenStatus(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true
  if (isTerminalKitchenStatus(from)) return false
  if (to === 'draft') return false
  if (to === 'cancelled') return cancelStatusAction(from) != null
  const fromI = fulfillmentStepIndex(from)
  const toI = fulfillmentStepIndex(to)
  if (fromI < 0 || toI < 0) return false
  return toI > fromI
}

/** Current status + later steps, then cancel if still allowed. */
export function forwardStatusChoices(status: OrderStatus): OrderStatus[] {
  if (isTerminalKitchenStatus(status)) return []
  const fromI = fulfillmentStepIndex(status)
  const choices: OrderStatus[] = FULFILLMENT_STEPS.filter((_, index) => index >= fromI)
  if (cancelStatusAction(status)) choices.push('cancelled')
  return choices
}

export function primaryStatusAction(status: OrderStatus): StatusAction | null {
  return nextStatusActions(status).find((action) => action.variant === 'primary') ?? null
}

export function cancelStatusAction(status: OrderStatus): StatusAction | null {
  return nextStatusActions(status).find((action) => action.variant === 'danger') ?? null
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
