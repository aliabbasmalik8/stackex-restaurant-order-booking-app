import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { StateBlock } from '@/components/layout/StateBlock'
import { OrderDetailPanel } from '@/components/orders/OrderDetailPanel'
import { OrderStatusActions } from '@/components/orders/OrderStatusActions'
import {
  formatMoney,
  formatWhen,
  statusTone,
} from '@/components/orders/format'
import { Text } from '@/components/ui'
import {
  useOrders,
  type OrdersFilter,
  type OrderStatus,
} from '@/modules/orders'

const FILTERS: OrdersFilter[] = ['active', 'all', 'completed', 'cancelled']

export function OrdersScreen() {
  const { t } = useTranslation()
  const {
    orders,
    filteredOrders,
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
        title={t('orders.title')}
        subtitle={t('orders.subtitle')}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex flex-wrap gap-1 rounded-pill border border-border bg-surface p-1"
          role="tablist"
          aria-label={t('orders.filters.label')}
        >
          {FILTERS.map((key) => {
            const active = filter === key
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(key)}
                className={[
                  'rounded-pill px-3 py-1.5 text-xs font-bold transition-colors',
                  active
                    ? 'bg-sel text-sel-text'
                    : 'text-sub hover:text-ink',
                ].join(' ')}
              >
                {t(`orders.filters.${key}`)}
              </button>
            )
          })}
        </div>

        <label className="block w-full sm:max-w-xs">
          <span className="sr-only">{t('orders.search')}</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('orders.searchPlaceholder')}
            className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-ink placeholder:text-muted outline-none focus:border-cta focus:ring-2 focus:ring-cta/20"
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
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[880px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-divider text-sub">
                <th className="px-4 py-3 font-extrabold uppercase tracking-[0.04em]">
                  {t('orders.columns.code')}
                </th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-[0.04em]">
                  {t('orders.columns.customer')}
                </th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-[0.04em]">
                  {t('orders.columns.status')}
                </th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-[0.04em]">
                  {t('orders.columns.branch')}
                </th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-[0.04em]">
                  {t('orders.columns.total')}
                </th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-[0.04em]">
                  {t('orders.columns.created')}
                </th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-[0.04em]">
                  {t('orders.columns.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const isSelected = selectedId === order.id
                return (
                  <tr
                    key={order.id}
                    className={[
                      'cursor-pointer border-b border-divider last:border-b-0 transition-colors',
                      isSelected ? 'bg-surface' : 'hover:bg-surface/60',
                    ].join(' ')}
                    onClick={() => setSelectedId(order.id)}
                  >
                    <td className="px-4 py-3">
                      <Text as="span" variant="bodyStrong" className="m-0">
                        {order.orderCode}
                      </Text>
                      <Text
                        as="span"
                        variant="caption"
                        className="mt-0.5 block text-muted"
                      >
                        {order.items.length} {t('orders.items')}
                      </Text>
                    </td>
                    <td className="px-4 py-3">
                      <Text as="span" variant="body" className="m-0 block">
                        {order.contact.name || '—'}
                      </Text>
                      <Text as="span" variant="caption" className="text-muted">
                        {order.contact.phone || '—'}
                      </Text>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          'inline-flex rounded-pill px-2.5 py-1 text-xs font-bold capitalize',
                          statusTone[order.status] ?? statusTone.pending,
                        ].join(' ')}
                      >
                        {t(`orders.status.${order.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sub">
                      {order.branchLabel || '—'}
                    </td>
                    <td className="px-4 py-3 font-bold text-ink">
                      {formatMoney(order.total)}
                    </td>
                    <td className="px-4 py-3 text-sub">
                      {formatWhen(order.createdAt)}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <OrderStatusActions
                        order={order}
                        updating={updatingId === order.id}
                        onUpdate={(status) =>
                          void onUpdateStatus(order.id, status)
                        }
                      />
                    </td>
                  </tr>
                )
              })}
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
