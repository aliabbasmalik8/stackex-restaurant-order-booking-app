import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Button, Text } from '@/components/ui'
import { isPaidButCancelled, type Order, type OrderStatus } from '@/modules/orders'
import {
  KitchenStatusBadge,
  PaymentSummaryBadge,
} from './OrderBadges'
import { formatMoney, formatWhen, formatCustomerAddress } from './format'
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
  const paidButCancelled = isPaidButCancelled(order)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
        aria-label={t('common.close')}
        onClick={onClose}
      />
      <aside className="relative z-10 flex h-full w-full max-w-xl flex-col border-s border-divider bg-card shadow-panel lg:max-w-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-divider bg-surface/40 px-5 py-5">
          <div className="min-w-0">
            <Text variant="label" className="m-0">
              {t('orders.detail.order')}
            </Text>
            <Text as="h2" variant="title" className="m-0 truncate tracking-tight">
              {order.orderCode}
            </Text>
            <div className="mt-2 flex flex-col items-start gap-1.5">
              <Text variant="caption" className="m-0 text-muted">
                {t('orders.detail.kitchenStatus')}
              </Text>
              <KitchenStatusBadge status={order.status} />
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

          <section className="mb-6">
            <Text variant="label" className="mb-2">
              {t('orders.detail.deliveryAddress')}
            </Text>
            <Text variant="bodyStrong" className="m-0">
              {formatCustomerAddress(order.customerAddress) || '—'}
            </Text>
            {order.customerAddress?.notes?.trim() ? (
              <Text variant="body" className="m-0 text-sub">
                {order.customerAddress.notes.trim()}
              </Text>
            ) : null}
          </section>

          <section className="mb-6 rounded-lg bg-surface px-4 py-3">
            <Text variant="label" className="mb-3">
              {t('orders.detail.payment')}
            </Text>
            <PaymentSummaryBadge order={order} />
            {paidButCancelled ? (
              <Text variant="caption" className="mt-2 text-error">
                {t('orders.detail.paidButCancelledHint')}
              </Text>
            ) : null}
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
    </div>,
    document.body,
  )
}
