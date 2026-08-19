import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Text } from '@/components/ui'
import {
  EDITABLE_ORDER_STATUSES,
  isDraftOrder,
  isFailedPayment,
  isUnpaidCardOrder,
  type Order,
  type OrderStatus,
} from '@/modules/orders'

type OrderStatusActionsProps = {
  order: Order
  updating?: boolean
  onUpdate: (status: OrderStatus) => void
  className?: string
}

export function OrderStatusActions({
  order,
  updating = false,
  onUpdate,
  className = '',
}: OrderStatusActionsProps) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<OrderStatus>(order.status)
  const unchanged = selected === order.status

  useEffect(() => {
    setSelected(order.status)
  }, [order.id, order.status])

  if (isDraftOrder(order) || isUnpaidCardOrder(order) || isFailedPayment(order)) {
    const hintKey = isFailedPayment(order)
      ? 'orders.actions.paymentFailed'
      : 'orders.actions.awaitingPayment'
    return (
      <Text as="span" variant="caption" className="font-bold text-muted">
        {t(hintKey)}
      </Text>
    )
  }

  return (
    <div className={['flex w-full items-center gap-2', className].join(' ')}>
      <label className="m-0 min-w-0 flex-1">
        <span className="sr-only">{t('orders.detail.kitchenStatus')}</span>
        <select
          value={selected}
          disabled={updating}
          className="dash-input h-11 w-full cursor-pointer px-3 text-sm font-extrabold"
          onChange={(e) => setSelected(e.target.value as OrderStatus)}
        >
          {EDITABLE_ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {t(`orders.status.${status}`)}
            </option>
          ))}
        </select>
      </label>
      <Button
        label={t('orders.actions.update')}
        variant="primary"
        loading={updating}
        disabled={updating || unchanged}
        className="h-11 shrink-0 px-5 text-sm"
        onClick={() => onUpdate(selected)}
      />
    </div>
  )
}
