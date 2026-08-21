import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui'
import {
  isPaidButCancelled,
  primaryStatusAction,
  type Order,
  type OrderStatus,
} from '@/modules/orders'
import { KitchenStatusBadge, PaymentSummaryBadge } from './OrderBadges'
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
        <div className="mb-6 rounded-2xl border border-divider bg-surface/40 px-4 py-4">
          <Text variant="label" className="mb-3 text-muted">
            {t('orders.detail.flow')}
          </Text>
          <OrderFulfillmentTrack status={order.status} size="full" />
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <section className="rounded-2xl border border-divider bg-surface/40 px-4 py-4">
          <Text variant="label" className="mb-2 text-muted">
            {t('orders.detail.customer')}
          </Text>
          <Text variant="bodyStrong" className="m-0 text-base">
            {order.contact.name || '—'}
          </Text>
          <Text variant="body" className="mt-1 text-sub">
            {order.contact.phone || '—'}
          </Text>
        </section>

        <section className="rounded-2xl border border-divider bg-surface/40 px-4 py-4">
          <Text variant="label" className="mb-2 text-muted">
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
              className="m-0 inline-block font-sans text-sm font-bold leading-snug text-link underline-offset-2 transition-colors duration-150 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2"
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

        <section className="rounded-2xl border border-divider bg-surface/40 px-4 py-4">
          <Text variant="label" className="mb-2 text-muted">
            {t('orders.detail.branch')}
          </Text>
          <Text variant="bodyStrong" className="m-0 text-base">
            {order.branchLabel || '—'}
          </Text>
          {order.address ? (
            <Text variant="body" className="mt-1 leading-snug text-sub">
              {order.address}
            </Text>
          ) : null}
          {order.readyAround ? (
            <Text variant="caption" className="mt-1 text-muted">
              {t('orders.detail.readyAround')}: {order.readyAround}
            </Text>
          ) : null}
        </section>

        <section className="rounded-2xl border border-divider bg-surface/40 px-4 py-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Text variant="label" className="m-0 text-muted">
              {t('orders.detail.payment')}
            </Text>
            <Text variant="caption" className="m-0 text-muted">
              {t(`orders.paymentMethod.${order.paymentMethod}`)}
            </Text>
          </div>
          <div className="inline-flex rounded-xl border border-border bg-card px-3 py-2">
            <PaymentSummaryBadge order={order} />
          </div>
          {paidButCancelled ? (
            <Text variant="caption" className="mt-2 text-error">
              {t('orders.detail.paidButCancelledHint')}
            </Text>
          ) : null}
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted">{t('orders.detail.paidAt')}</dt>
              <dd className="text-end text-ink">{formatWhen(order.paidAt)}</dd>
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

      <section className="mt-6">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <Text variant="label" className="m-0 text-muted">
            {t('orders.detail.items')}
          </Text>
          <Text variant="caption" className="m-0 text-muted">
            {order.items.length}
          </Text>
        </div>
        <ul className="overflow-hidden rounded-2xl border border-divider bg-card">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 border-b border-divider px-4 py-3 transition-colors duration-150 last:border-b-0 hover:bg-surface/40"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="size-12 shrink-0 rounded-xl object-cover ring-1 ring-inset ring-border"
                />
              ) : null}
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <Text
                  as="span"
                  variant="caption"
                  className="min-w-7 rounded-lg bg-surface px-1.5 py-1 text-center tabular-nums text-sub"
                >
                  {item.quantity}×
                </Text>
                <div className="min-w-0">
                  <Text variant="bodyStrong" className="m-0 leading-snug">
                    {item.name}
                  </Text>
                  {item.optionsSummary ? (
                    <Text variant="caption" className="mt-0.5 text-muted">
                      {item.optionsSummary}
                    </Text>
                  ) : null}
                  <Text variant="caption" className="mt-1 text-muted">
                    {formatMoney(item.unitPrice)}
                  </Text>
                </div>
              </div>
              <Text variant="bodyStrong" className="m-0 shrink-0 tabular-nums">
                {formatMoney(item.unitPrice * item.quantity)}
              </Text>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-2xl border border-divider bg-surface px-4 py-4">
        <div className="flex justify-between text-sm text-sub">
          <span>{t('orders.detail.subtotal')}</span>
          <span className="tabular-nums">{formatMoney(order.subtotal)}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm text-sub">
          <span>{t('orders.detail.vat')}</span>
          <span className="tabular-nums">{formatMoney(order.vat)}</span>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-divider pt-3 text-base font-extrabold text-ink">
          <span>{t('orders.detail.total')}</span>
          <span className="text-xl tabular-nums">{formatMoney(order.total)}</span>
        </div>
      </section>

      <div className="mt-5 flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-divider pt-3 text-xs text-muted">
        <span>
          {t('orders.detail.order')} #{order.orderCode}
        </span>
        <span>
          {t('orders.detail.created')}: {formatWhen(order.createdAt)}
        </span>
      </div>
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
  const next = primaryStatusAction(order.status)

  return (
    <div className="rounded-2xl border border-divider bg-surface/40 p-4">
      <div className="mb-5 border-b border-divider pb-5">
        <Text variant="label" className="mb-3 text-muted">
          {t('orders.detail.flow')}
        </Text>
        <OrderFulfillmentTrack status={order.status} size="full" />
      </div>

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Text variant="label" className="m-0 text-muted">
            {t('orders.detail.updateStatus')}
          </Text>
          <Text variant="bodyStrong" className="mt-1">
            {next
              ? `${t('orders.detail.next')}: ${t(next.labelKey)}`
              : t(`orders.status.${order.status}`)}
          </Text>
        </div>
        <KitchenStatusBadge status={order.status} />
      </div>

      <OrderStatusActions
        order={order}
        updating={updating}
        onUpdate={onUpdateStatus}
        className="transition-opacity duration-150"
      />

      {updating ? (
        <Text
          variant="caption"
          className="mt-3 block text-muted"
          role="status"
          aria-live="polite"
        >
          {t('common.loading')}
        </Text>
      ) : null}
    </div>
  )
}
