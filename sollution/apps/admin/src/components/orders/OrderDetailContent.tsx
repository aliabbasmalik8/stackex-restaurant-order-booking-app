import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui'
import {
  isPaidButCancelled,
  type Order,
  type OrderStatus,
} from '@/modules/orders'
import { PaymentSummaryBadge } from './OrderBadges'
import { formatMoney, formatWhen, formatCustomerAddress, mapsUrl } from './format'
import { OrderFulfillmentTrack } from './OrderFulfillmentTrack'
import { OrderStatusActions } from './OrderStatusActions'

export function OrderDetailContent({
  order,
  showTrack = false,
}: {
  order: Order
  showTrack?: boolean
}) {
  const { t } = useTranslation()
  const paidButCancelled = isPaidButCancelled(order)
  const deliveryLabel = formatCustomerAddress(order.customerAddress)

  return (
    <div>
      {showTrack ? (
        <div className="mb-5 rounded-2xl border border-divider bg-card px-4 py-4">
          <Text variant="label" className="mb-3">
            {t('orders.detail.flow')}
          </Text>
          <OrderFulfillmentTrack status={order.status} size="full" />
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-divider bg-surface/40 px-4 py-3.5">
          <Text variant="label" className="mb-2">
            {t('orders.detail.customer')}
          </Text>
          <Text variant="bodyStrong" className="m-0">
            {order.contact.name || '—'}
          </Text>
          <Text variant="body" className="m-0 text-sub">
            {order.contact.phone || '—'}
          </Text>
        </section>

        <section className="rounded-2xl border border-divider bg-surface/40 px-4 py-3.5">
          <Text variant="label" className="mb-2">
            {t('orders.detail.deliveryAddress')}
          </Text>
          {deliveryLabel ? (
            <a
              href={mapsUrl(
                deliveryLabel,
                order.customerAddress?.lat,
                order.customerAddress?.lng,
              )}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('orders.detail.openInMaps')}
              className="m-0 inline-block font-sans text-[15px] font-bold text-link underline-offset-2 hover:underline"
            >
              {deliveryLabel}
            </a>
          ) : (
            <Text variant="bodyStrong" className="m-0">
              —
            </Text>
          )}
          {order.customerAddress?.notes?.trim() ? (
            <Text variant="body" className="m-0 text-sub">
              {order.customerAddress.notes.trim()}
            </Text>
          ) : null}
        </section>

        <section className="rounded-2xl border border-divider bg-surface/40 px-4 py-3.5">
          <Text variant="label" className="mb-2">
            {t('orders.detail.branch')}
          </Text>
          <Text variant="bodyStrong" className="m-0">
            {order.branchLabel || '—'}
          </Text>
          {order.address ? (
            <Text variant="body" className="m-0 text-sub">
              {order.address}
            </Text>
          ) : null}
          {order.readyAround ? (
            <Text variant="caption" className="mt-1 text-muted">
              {t('orders.detail.readyAround')}: {order.readyAround}
            </Text>
          ) : null}
        </section>

        <section className="rounded-2xl border border-divider bg-surface/40 px-4 py-3.5">
          <Text variant="label" className="mb-3">
            {t('orders.detail.payment')}
          </Text>
          <PaymentSummaryBadge order={order} />
          {paidButCancelled ? (
            <Text variant="caption" className="mt-2 text-error">
              {t('orders.detail.paidButCancelledHint')}
            </Text>
          ) : null}
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">{t('orders.detail.paidAt')}</dt>
              <dd className="text-ink">{formatWhen(order.paidAt)}</dd>
            </div>
            {order.stripePaymentIntentId ? (
              <div className="flex flex-col gap-1">
                <dt className="text-muted">{t('orders.detail.paymentIntent')}</dt>
                <dd className="break-all font-mono text-[11px] text-sub">
                  {order.stripePaymentIntentId}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
      </div>

      <section className="mt-5">
        <Text variant="label" className="mb-3">
          {t('orders.detail.items')}
        </Text>
        <ul className="overflow-hidden rounded-2xl border border-divider">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 border-b border-divider bg-card px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <Text variant="bodyStrong" className="m-0">
                  {item.quantity}× {item.name}
                </Text>
                {item.optionsSummary ? (
                  <Text variant="caption" className="text-muted">
                    {item.optionsSummary}
                  </Text>
                ) : null}
              </div>
              <Text variant="body" className="m-0 shrink-0 font-bold tabular-nums">
                {formatMoney(item.unitPrice * item.quantity)}
              </Text>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-2xl bg-surface px-4 py-3.5">
        <div className="flex justify-between text-sm text-sub">
          <span>{t('orders.detail.subtotal')}</span>
          <span className="tabular-nums">{formatMoney(order.subtotal)}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm text-sub">
          <span>{t('orders.detail.vat')}</span>
          <span className="tabular-nums">{formatMoney(order.vat)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-divider pt-2 text-sm font-extrabold text-ink">
          <span>{t('orders.detail.total')}</span>
          <span className="tabular-nums">{formatMoney(order.total)}</span>
        </div>
      </section>

      <Text variant="caption" className="mt-4 text-muted">
        {t('orders.detail.created')}: {formatWhen(order.createdAt)}
      </Text>
    </div>
  )
}

export function OrderDetailStatusBar({
  order,
  updating,
  onUpdateStatus,
}: {
  order: Order
  updating?: boolean
  onUpdateStatus: (status: OrderStatus) => void
}) {
  const { t } = useTranslation()
  return (
    <div>
      <Text variant="label" className="mb-3">
        {t('orders.detail.updateStatus')}
      </Text>
      <OrderStatusActions
        order={order}
        updating={updating}
        onUpdate={onUpdateStatus}
      />
    </div>
  )
}
