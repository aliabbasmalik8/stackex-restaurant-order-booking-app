import type { OrderStatus } from './types'

/** In-flight pickup orders. */
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
