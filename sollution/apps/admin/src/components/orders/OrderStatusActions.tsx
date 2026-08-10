import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import {
  nextStatusActions,
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
  const actions = nextStatusActions(order.status)

  if (actions.length === 0) {
    return (
      <span className="text-xs font-bold text-muted">{t('orders.actions.none')}</span>
    )
  }

  return (
    <div className={['flex flex-wrap items-center gap-2', className].join(' ')}>
      {actions.map((action) => {
        const isDanger = action.variant === 'danger'
        return (
          <Button
            key={action.to}
            label={t(action.labelKey)}
            variant={isDanger ? 'ghost' : action.variant === 'primary' ? 'primary' : 'secondary'}
            loading={updating}
            disabled={updating}
            className={[
              'h-9 px-3 text-xs',
              isDanger ? 'text-error hover:bg-error/10' : '',
            ].join(' ')}
            onClick={(e) => {
              e.stopPropagation()
              onUpdate(action.to)
            }}
          />
        )
      })}
    </div>
  )
}
