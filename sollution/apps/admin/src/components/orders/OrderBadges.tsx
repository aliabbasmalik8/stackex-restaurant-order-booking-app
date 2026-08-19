import { useTranslation } from 'react-i18next'
import type { Order, OrderStatus, PaymentStatus } from '@/modules/orders'
import {
  paymentStatusTone,
  statusTone,
} from './format'

function badgeClass(tone: string) {
  return [
    'inline-flex rounded-pill px-2.5 py-1 text-xs font-bold ring-1 ring-inset ring-black/5',
    tone,
  ].join(' ')
}

/** Kitchen / fulfillment status only. */
export function KitchenStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation()
  return (
    <span className={badgeClass(statusTone[status] ?? statusTone.pending)}>
      {t(`orders.status.${status}`)}
    </span>
  )
}

/**
 * One payment chip: "Card · Paid", "Cash on Delivery · On delivery".
 * Avoids stacking method + status that look like conflicting Cancelled/Paid.
 */
export function PaymentSummaryBadge({ order }: { order: Order }) {
  const { t } = useTranslation()
  const method = t(`orders.paymentMethod.${order.paymentMethod}`)
  const status = t(`orders.paymentStatus.${order.paymentStatus}`)
  return (
    <span
      className={badgeClass(
        paymentStatusTone[order.paymentStatus] ?? paymentStatusTone.unpaid,
      )}
    >
      {method} · {status}
    </span>
  )
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { t } = useTranslation()
  return (
    <span className={badgeClass(paymentStatusTone[status])}>
      {t(`orders.paymentStatus.${status}`)}
    </span>
  )
}
