import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button, StateMessage, Text } from '@/components/ui'
import { AppHeader } from '@/components/layout/AppHeader'
import { useCart } from '@/context/CartContext'
import { useUserOrders, type Order, type OrderStatus } from '@/core/orders'
import { localized } from '@/utils/localized'
import { moneyFixed } from '@/utils/money'
import { useLanguage } from '@/i18n/LanguageContext'

type Filter = 'current' | 'previous'

function statusLabelKey(
  status: OrderStatus,
):
  | 'orders.status.pending'
  | 'orders.status.confirmed'
  | 'orders.status.preparing'
  | 'orders.status.ready'
  | 'orders.status.completed'
  | 'orders.status.cancelled' {
  switch (status) {
    case 'confirmed':
      return 'orders.status.confirmed'
    case 'preparing':
      return 'orders.status.preparing'
    case 'ready':
      return 'orders.status.ready'
    case 'completed':
      return 'orders.status.completed'
    case 'cancelled':
      return 'orders.status.cancelled'
    default:
      return 'orders.status.pending'
  }
}

function formatOrderDate(iso: string, locale: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(locale === 'ar' ? 'ar' : 'en', {
    month: 'short',
    day: 'numeric',
  })
}

function itemSummary(order: Order, locale: string): string {
  const names = order.items.map((line) =>
    localized(locale, line.name, line.name_arabic),
  )
  const head = names.slice(0, 2).join(', ')
  return names.length > 2 ? `${head} +${names.length - 2}` : head
}

export function OrdersScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { locale } = useLanguage()
  const { addItem } = useCart()
  const { currentOrders, pastOrders, loading, errorCode, error, refetch } =
    useUserOrders()
  const [filter, setFilter] = useState<Filter>('current')

  const list = filter === 'current' ? currentOrders : pastOrders
  const emptyTitle =
    filter === 'current'
      ? t('orders.emptyCurrentTitle')
      : t('orders.emptyPreviousTitle')
  const emptyMessage =
    filter === 'current'
      ? t('orders.emptyCurrentMessage')
      : t('orders.emptyPreviousMessage')

  const tabs = useMemo(
    () =>
      [
        { id: 'current' as const, label: t('orders.filterCurrent') },
        { id: 'previous' as const, label: t('orders.filterPrevious') },
      ],
    [t],
  )

  const reorder = (order: Order) => {
    try {
      for (const line of order.items) {
        addItem({
          menuItemId: line.menuItemId,
          name: line.name,
          name_arabic: line.name_arabic,
          image: line.image,
          unitPrice: line.unitPrice,
          quantity: line.quantity,
          optionsSummary: line.optionsSummary,
          optionsSummary_arabic: line.optionsSummary_arabic,
          selectedOptionIds: line.selectedOptionIds,
          specialInstructions: line.specialInstructions,
        })
      }
      navigate('/menu')
    } catch {
      navigate('/menu')
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-page">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-[720px] flex-1 flex-col overflow-y-auto px-6 py-8">
        <Text as="h1" variant="display">
          {t('orders.title')}
        </Text>

        <div className="mt-5 flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={[
                'rounded-pill px-4 py-2 text-[13px] font-extrabold',
                filter === tab.id
                  ? 'bg-sel text-sel-text'
                  : 'bg-surface text-sub',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="mt-10 text-[13.5px] font-semibold text-sub">
            {t('common.loading')}
          </p>
        ) : errorCode ? (
          <StateMessage
            errorCode={errorCode}
            error={error}
            onAction={() => void refetch()}
          />
        ) : list.length === 0 ? (
          <div className="mt-12 flex max-w-md flex-col gap-3">
            <Text variant="title">{emptyTitle}</Text>
            <Text variant="subtitle" className="text-sub">
              {emptyMessage}
            </Text>
            <Button
              variant="secondary"
              label={t('orders.browseMenu')}
              onClick={() => navigate('/menu')}
              className="mt-2 w-fit"
            />
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3.5">
            {list.map((order) => (
              <article
                key={order.id}
                className="rounded-[20px] bg-card p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-extrabold">
                      #{order.orderCode}
                    </p>
                    <p className="mt-1 text-[12.5px] font-bold text-sub">
                      {t(statusLabelKey(order.status))}
                    </p>
                  </div>
                  <span className="text-[12px] font-bold text-muted">
                    {formatOrderDate(order.createdAt, locale)}
                  </span>
                </div>
                <p className="mt-3 text-[13px] font-semibold text-sub">
                  {itemSummary(order, locale)}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-display text-[15px] font-bold text-price">
                    {moneyFixed(order.total)}
                  </span>
                  {filter === 'previous' ? (
                    <button
                      type="button"
                      onClick={() => reorder(order)}
                      className="text-[13px] font-extrabold text-link"
                    >
                      {t('orders.reorder')}
                    </button>
                  ) : order.readyAround ? (
                    <span className="text-[12px] font-bold text-sub">
                      {t('orders.readyAround', { time: order.readyAround })}
                    </span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
