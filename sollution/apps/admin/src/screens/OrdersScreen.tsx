import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { StateBlock } from '@/components/layout/StateBlock'
import { Button, Text } from '@/components/ui'
import { useOrders, type OrderStatus } from '@/modules/orders'

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatWhen(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}

const statusTone: Record<OrderStatus, string> = {
  pending: 'bg-surface text-sub',
  confirmed: 'bg-sel/10 text-ink',
  preparing: 'bg-badge/15 text-ink',
  ready: 'bg-cta/15 text-ink',
  completed: 'bg-surface text-muted',
  cancelled: 'bg-error/10 text-error',
}

export function OrdersScreen() {
  const { t } = useTranslation()
  const { orders, loading, error, refresh } = useOrders()

  return (
    <section>
      <PageHeader
        title={t('orders.title')}
        subtitle={t('orders.subtitle')}
        action={
          <Button
            label={t('common.refresh')}
            variant="secondary"
            className="h-10 px-4 text-sm"
            onClick={() => void refresh()}
            disabled={loading}
          />
        }
      />

      <StateBlock
        loading={loading}
        error={error}
        empty={orders.length === 0}
        emptyTitle={t('orders.emptyTitle')}
        emptyBody={t('orders.emptyBody')}
        onRetry={() => void refresh()}
      >
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
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
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-divider last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <Text as="span" variant="bodyStrong" className="m-0">
                      {order.orderCode}
                    </Text>
                    <Text as="span" variant="caption" className="mt-0.5 block text-muted">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StateBlock>
    </section>
  )
}
