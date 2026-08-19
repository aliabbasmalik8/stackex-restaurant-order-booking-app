import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { KitchenStatusBadge } from '@/components/orders/OrderBadges'
import {
  OrderDetailContent,
  OrderDetailStatusBar,
} from '@/components/orders/OrderDetailContent'
import { Text } from '@/components/ui'
import { primaryStatusAction, useOrder } from '@/modules/orders'

export function OrderDetailScreen() {
  const { t } = useTranslation()
  const { orderId } = useParams<{ orderId: string }>()
  const { order, loading, error, notFound, updating, updateError, setStatus } =
    useOrder(orderId)

  if (!orderId) {
    return <Navigate to="/orders" replace />
  }

  if (loading) {
    return (
      <Text variant="subtitle" className="py-12 text-center text-sub">
        {t('common.loading')}
      </Text>
    )
  }

  if (notFound || !order) {
    return (
      <section>
        <PageHeader
          eyebrow={t('nav.orders')}
          title={
            notFound ? t('orders.page.notFoundTitle') : t('orders.detail.order')
          }
          action={
            <Link
              to="/orders"
              className="inline-flex h-10 items-center rounded-pill border border-border bg-card px-4 text-sm font-bold text-ink shadow-sm transition hover:bg-surface"
            >
              {t('common.back')}
            </Link>
          }
        />
        <Text variant="caption" className="text-error">
          {error || t('orders.page.notFoundBody')}
        </Text>
      </section>
    )
  }

  const next = primaryStatusAction(order.status)

  return (
    <section>
      <PageHeader
        eyebrow={t('nav.orders')}
        title={`${t('orders.detail.order')} #${order.orderCode}`}
        subtitle={
          next
            ? `${t('orders.detail.next')}: ${t(next.labelKey)}`
            : order.contact.name || undefined
        }
        action={
          <Link
            to="/orders"
            className="inline-flex h-10 items-center rounded-pill border border-border bg-card px-4 text-sm font-bold text-ink shadow-sm transition hover:bg-surface"
          >
            {t('common.back')}
          </Link>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <KitchenStatusBadge status={order.status} />
      </div>

      {error && !notFound ? (
        <Text variant="caption" className="mb-3 text-error">
          {error}
        </Text>
      ) : null}
      {updateError ? (
        <Text variant="caption" className="mb-3 text-error">
          {updateError}
        </Text>
      ) : null}

      <div className="dash-panel p-5 md:p-6">
        <OrderDetailContent order={order} showTrack />
        <div className="mt-6 border-t border-divider pt-5">
          <OrderDetailStatusBar
            order={order}
            updating={updating}
            onUpdateStatus={(status) => void setStatus(status)}
          />
        </div>
      </div>
    </section>
  )
}
