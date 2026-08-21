import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { StateBlock } from '@/components/layout/StateBlock'
import { PaymentSummaryBadge, KitchenStatusBadge } from '@/components/orders/OrderBadges'
import { OrderDetailPanel } from '@/components/orders/OrderDetailPanel'
import { formatMoney, formatWhenShort } from '@/components/orders/format'
import { Text } from '@/components/ui'
import {
  useOrders,
  type OrdersFilter,
  type OrderStatus,
} from '@/modules/orders'

const FILTERS: OrdersFilter[] = [
  'active',
  'awaitingPayment',
  'all',
  'completed',
  'cancelled',
]

export function OrdersScreen() {
  const { t } = useTranslation()
  const {
    orders,
    filteredOrders,
    stats,
    loading,
    error,
    filter,
    setFilter,
    search,
    setSearch,
    updatingId,
    updateError,
    clearUpdateError,
    setStatus,
  } = useOrders()

  const [selectedId, setSelectedId] = useState<string | null>(null)

  const panelOrder = useMemo(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId],
  )

  const onUpdateStatus = async (orderId: string, status: OrderStatus) => {
    clearUpdateError()
    await setStatus(orderId, status)
  }

  return (
    <section>
      <PageHeader
        eyebrow={t('nav.main')}
        title={t('orders.title')}
        subtitle={t('orders.subtitle')}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label={t('orders.stats.active')}
          value={String(stats.active)}
          onClick={() => setFilter('active')}
          active={filter === 'active'}
        />
        <StatCard
          label={t('orders.stats.awaitingPayment')}
          value={String(stats.awaitingPayment)}
          onClick={() => setFilter('awaitingPayment')}
          active={filter === 'awaitingPayment'}
          tone={stats.awaitingPayment > 0 ? 'warn' : 'default'}
        />
        <StatCard
          label={t('orders.stats.paidToday')}
          value={String(stats.paidToday)}
        />
        <StatCard
          label={t('orders.stats.revenueToday')}
          value={formatMoney(stats.revenueToday)}
        />
      </div>

      <div className="dash-toolbar mb-5">
        <div
          className="dash-chip-group"
          role="tablist"
          aria-label={t('orders.filters.label')}
        >
          {FILTERS.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              className="dash-chip"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
            >
              {t(`orders.filters.${key}`)}
              {key === 'awaitingPayment' && stats.awaitingPayment > 0
                ? ` (${stats.awaitingPayment})`
                : null}
            </button>
          ))}
        </div>

        <label className="block w-full sm:max-w-xs">
          <span className="sr-only">{t('orders.search')}</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('orders.searchPlaceholder')}
            className="dash-input"
          />
        </label>
      </div>

      {updateError ? (
        <Text variant="caption" className="mb-3 text-error">
          {updateError}
        </Text>
      ) : null}

      <StateBlock
        loading={loading}
        error={error}
        empty={filteredOrders.length === 0}
        emptyTitle={t('orders.emptyTitle')}
        emptyBody={
          search.trim() || filter !== 'all'
            ? t('orders.emptyFiltered')
            : t('orders.emptyBody')
        }
      >
        <div className="dash-panel overflow-x-auto">
          <table className="dash-table dash-table-orders">
            <thead>
              <tr>
                <th>{t('orders.columns.code')}</th>
                <th>{t('orders.columns.customer')}</th>
                <th>{t('orders.columns.status')}</th>
                <th>{t('orders.columns.payment')}</th>
                <th>{t('orders.columns.branch')}</th>
                <th>{t('orders.columns.total')}</th>
                <th>{t('orders.columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  data-selected={selectedId === order.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedId(order.id)}
                >
                  <td className="min-w-36">
                    <Text as="span" variant="bodyStrong" className="m-0 text-base font-extrabold tabular-nums">
                      #{order.orderCode}
                    </Text>
                    <Text
                      as="span"
                      variant="caption"
                      className="mt-0.5 block font-semibold text-muted"
                    >
                      {order.items.length} {t('orders.items')} · {formatWhenShort(order.createdAt)}
                    </Text>
                  </td>
                  <td className="min-w-44">
                    <Text as="span" variant="bodyStrong" className="m-0 block">
                      {order.contact.name || '—'}
                    </Text>
                    <Text as="span" variant="caption" className="font-semibold text-muted">
                      {order.contact.phone || '—'}
                    </Text>
                  </td>
                  <td>
                    <KitchenStatusBadge status={order.status} />
                  </td>
                  <td>
                    <PaymentSummaryBadge order={order} />
                  </td>
                  <td className="min-w-32 font-semibold text-sub">
                    {order.branchLabel || '—'}
                  </td>
                  <td className="whitespace-nowrap text-end font-display text-base font-bold tracking-tight text-ink tabular-nums">
                    {formatMoney(order.total)}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <Link
                      to={`/orders/${order.id}`}
                      className="inline-flex rounded-pill bg-surface px-3 py-1.5 text-xs font-extrabold text-ink ring-1 ring-border transition-[background-color,box-shadow,transform] duration-150 hover:bg-card hover:shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2"
                    >
                      {t('common.edit')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StateBlock>

      {panelOrder ? (
        <OrderDetailPanel
          order={panelOrder}
          updating={updatingId === panelOrder.id}
          onClose={() => setSelectedId(null)}
          onUpdateStatus={(status) =>
            void onUpdateStatus(panelOrder.id, status)
          }
        />
      ) : null}
    </section>
  )
}

function StatCard({
  label,
  value,
  onClick,
  active = false,
  tone = 'default',
  className = '',
}: {
  label: string
  value: string
  onClick?: () => void
  active?: boolean
  tone?: 'default' | 'warn'
  className?: string
}) {
  const classes = [
    'dash-panel w-full rounded-xl px-5 py-4 text-start transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out sm:px-6 sm:py-5',
    onClick
      ? 'cursor-pointer hover:-translate-y-0.5 hover:bg-surface/80 hover:shadow-[0_10px_24px_rgba(21,34,56,0.1)] active:scale-[0.985]'
      : '',
    active
      ? 'border-cta/60 bg-surface ring-2 ring-cta/25 shadow-[0_8px_22px_rgba(21,34,56,0.1)]'
      : '',
    tone === 'warn' ? 'bg-badge/15' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const body = (
    <>
      <Text variant="label" className="m-0 text-muted">
        {label}
      </Text>
      <Text as="p" variant="title" className="m-0 mt-1 tracking-tight">
        {value}
      </Text>
    </>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {body}
      </button>
    )
  }

  return <div className={classes}>{body}</div>
}
