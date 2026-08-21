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
              aria-label={`${t('common.back')} ${t('nav.orders')}`}
              className="inline-flex h-10 items-center rounded-pill border border-border bg-card px-4 text-sm font-bold text-ink shadow-sm transition-[background-color,box-shadow,transform] duration-150 hover:bg-surface hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 active:scale-[0.98]"
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
        title={
          <>
            <span>{t('orders.detail.order')} </span>
            <span className="font-mono text-[1.9rem] font-extrabold tabular-nums tracking-tight md:text-[2rem]">
              #{order.orderCode}
            </span>
          </>
        }
        subtitle={
          next
            ? `${t('orders.detail.next')}: ${t(next.labelKey)}`
            : order.contact.name || undefined
        }
        action={
          <Link
            to="/orders"
            aria-label={`${t('common.back')} ${t('nav.orders')}`}
            className="inline-flex h-10 items-center rounded-pill border border-border bg-card px-4 text-sm font-bold text-ink shadow-sm transition-[background-color,box-shadow,transform] duration-150 hover:bg-surface hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            {t('common.back')}
          </Link>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface/40 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Text variant="label" className="shrink-0 text-muted">
            {t('orders.detail.kitchenStatus')}
          </Text>
          <KitchenStatusBadge status={order.status} />
        </div>
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
        <OrderDetailContent order={order} />
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
