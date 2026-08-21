import { useTranslation } from 'react-i18next'
import type { Order, OrderStatus, PaymentStatus } from '@/modules/orders'
import {
  paymentStatusTone,
  statusTone,
} from './format'

const statusMarkerTone: Record<OrderStatus, string> = {
  draft: 'bg-border',
  pending: 'bg-muted',
  confirmed: 'bg-ink',
  preparing: 'bg-badge',
  ready: 'bg-cta',
  completed: 'bg-ink/55',
  cancelled: 'bg-error',
}

const paymentMarkerTone: Record<PaymentStatus, string> = {
  not_required: 'bg-border',
  unpaid: 'bg-badge',
  paid: 'bg-cta',
  failed: 'bg-error',
  cancelled: 'bg-error',
}

function badgeClass(tone: string) {
  return [
    'inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap rounded-pill px-2.5 py-1 text-xs font-bold leading-tight ring-1 ring-inset ring-border/70 transition-[background-color,color,box-shadow] duration-150',
    tone,
  ].join(' ')
}

function BadgeMarker({ tone }: { tone: string }) {
  return <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${tone}`} />
}

/** Kitchen / fulfillment status only. */
export function KitchenStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation()
  return (
    <span
      className={badgeClass(
        statusTone[status] ?? statusTone.pending,
      )}
    >
      <BadgeMarker tone={statusMarkerTone[status] ?? statusMarkerTone.pending} />
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
  const paymentLabel = method === status ? method : `${method} · ${status}`
  return (
    <span
      className={badgeClass(
        paymentStatusTone[order.paymentStatus] ?? paymentStatusTone.unpaid,
      )}
    >
      <BadgeMarker
        tone={paymentMarkerTone[order.paymentStatus] ?? paymentMarkerTone.unpaid}
      />
      {paymentLabel}
    </span>
  )
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { t } = useTranslation()
  return (
    <span className={badgeClass(paymentStatusTone[status])}>
      <BadgeMarker tone={paymentMarkerTone[status]} />
      {t(`orders.paymentStatus.${status}`)}
    </span>
  )
}
