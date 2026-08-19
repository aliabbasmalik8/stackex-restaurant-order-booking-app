import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Text } from '@/components/ui'
import {
  primaryStatusAction,
  type Order,
  type OrderStatus,
} from '@/modules/orders'
import { KitchenStatusBadge } from './OrderBadges'
import {
  OrderDetailContent,
  OrderDetailStatusBar,
} from './OrderDetailContent'
import { OrderFulfillmentTrack } from './OrderFulfillmentTrack'

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
  const next = primaryStatusAction(order.status)

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
        <header className="border-b border-divider bg-surface/50 px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Text variant="label" className="m-0">
                {t('orders.detail.order')} #{order.orderCode}
              </Text>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <KitchenStatusBadge status={order.status} />
                {next ? (
                  <Text as="span" variant="caption" className="m-0 font-semibold text-muted">
                    {t('orders.detail.next')}: {t(next.labelKey)}
                  </Text>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Link
                to={`/orders/${order.id}`}
                className="inline-flex h-9 items-center rounded-xl px-3 text-sm font-extrabold text-link hover:underline"
              >
                {t('orders.detail.openFullPage')}
              </Link>
              <Button
                label={t('common.close')}
                variant="ghost"
                className="h-9 shrink-0 rounded-xl px-3 text-sm"
                onClick={onClose}
              />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-divider bg-card px-4 py-4">
            <Text variant="label" className="mb-3">
              {t('orders.detail.flow')}
            </Text>
            <OrderFulfillmentTrack status={order.status} size="full" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <OrderDetailContent order={order} />
        </div>

        <footer className="border-t border-divider bg-card px-5 py-4">
          <OrderDetailStatusBar
            order={order}
            updating={updating}
            onUpdateStatus={onUpdateStatus}
          />
        </footer>
      </aside>
    </div>,
    document.body,
  )
}
