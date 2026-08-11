import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Text } from '@/components/ui'
import type { Order, OrderStatus } from '@/modules/orders'
import {
  formatMoney,
  formatWhen,
  paymentMethodTone,
  paymentStatusTone,
  statusTone,
} from './format'
import { OrderStatusActions } from './OrderStatusActions'

type OrderDetailPanelProps = {
  order: Order
  updating?: boolean
  onClose: () => void
  onUpdateStatus: (status: OrderStatus) => void
}

export function OrderDetailPanel({
  order,
  updating = false,
  onClose,
  onUpdateStatus,
}: OrderDetailPanelProps) {
  const { t } = useTranslation()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
        aria-label={t('common.close')}
        onClick={onClose}
      />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-s border-divider bg-card shadow-panel dash-fade-in">
        <header className="flex items-start justify-between gap-3 border-b border-divider bg-surface/40 px-5 py-5">
          <div className="min-w-0">
            <Text variant="label" className="m-0">
              {t('orders.detail.order')}
            </Text>
            <Text as="h2" variant="title" className="m-0 truncate tracking-tight">
              {order.orderCode}
            </Text>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span
                className={[
                  'inline-flex rounded-pill px-2.5 py-1 text-xs font-bold capitalize ring-1 ring-inset ring-black/5',
                  statusTone[order.status],
                ].join(' ')}
              >
                {t(`orders.status.${order.status}`)}
              </span>
              <span
                className={[
                  'inline-flex rounded-pill px-2.5 py-1 text-xs font-bold capitalize ring-1 ring-inset ring-black/5',
                  paymentStatusTone[order.paymentStatus],
                ].join(' ')}
              >
                {t(`orders.paymentStatus.${order.paymentStatus}`)}
              </span>
            </div>
          </div>
          <Button
            label={t('common.close')}
            variant="ghost"
            className="h-9 shrink-0 rounded-xl px-3 text-sm"
            onClick={onClose}
          />
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <section className="mb-6">
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

          <section className="mb-6">
            <Text variant="label" className="mb-2">
              {t('orders.detail.pickup')}
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

          <section className="mb-6 rounded-lg bg-surface px-4 py-3">
            <Text variant="label" className="mb-3">
              {t('orders.detail.payment')}
            </Text>
            <div className="flex flex-wrap gap-1.5">
              <span
                className={[
                  'inline-flex rounded-pill px-2.5 py-1 text-xs font-bold capitalize ring-1 ring-inset ring-black/5',
                  paymentMethodTone[order.paymentMethod],
                ].join(' ')}
              >
                {t(`orders.paymentMethod.${order.paymentMethod}`)}
              </span>
              <span
                className={[
                  'inline-flex rounded-pill px-2.5 py-1 text-xs font-bold capitalize ring-1 ring-inset ring-black/5',
                  paymentStatusTone[order.paymentStatus],
                ].join(' ')}
              >
                {t(`orders.paymentStatus.${order.paymentStatus}`)}
              </span>
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t('orders.detail.paidAt')}</dt>
                <dd className="text-ink">{formatWhen(order.paidAt)}</dd>
              </div>
              {order.stripePaymentIntentId ? (
                <div className="flex flex-col gap-1">
                  <dt className="text-muted">
                    {t('orders.detail.paymentIntent')}
                  </dt>
                  <dd className="break-all font-mono text-xs text-sub">
                    {order.stripePaymentIntentId}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="mb-6">
            <Text variant="label" className="mb-3">
              {t('orders.detail.items')}
            </Text>
            <ul className="flex flex-col gap-3">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 border-b border-divider pb-3 last:border-b-0"
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
                  <Text variant="body" className="m-0 shrink-0 font-bold">
                    {formatMoney(item.unitPrice * item.quantity)}
                  </Text>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-6 rounded-lg bg-surface px-4 py-3">
            <div className="flex justify-between text-sm text-sub">
              <span>{t('orders.detail.subtotal')}</span>
              <span>{formatMoney(order.subtotal)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm text-sub">
              <span>{t('orders.detail.vat')}</span>
              <span>{formatMoney(order.vat)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-divider pt-2 text-sm font-extrabold text-ink">
              <span>{t('orders.detail.total')}</span>
              <span>{formatMoney(order.total)}</span>
            </div>
          </section>

          <Text variant="caption" className="text-muted">
            {t('orders.detail.created')}: {formatWhen(order.createdAt)}
          </Text>
        </div>

        <footer className="border-t border-divider px-5 py-4">
          <Text variant="label" className="mb-3">
            {t('orders.detail.updateStatus')}
          </Text>
          <OrderStatusActions
            order={order}
            updating={updating}
            onUpdate={onUpdateStatus}
          />
        </footer>
      </aside>
    </div>
  )
}
