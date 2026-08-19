import { useTranslation } from 'react-i18next'
import {
  FULFILLMENT_STEPS,
  fulfillmentStepTone,
  type FulfillmentStep,
  type OrderStatus,
} from '@/modules/orders'
import { KitchenStatusBadge } from './OrderBadges'

type OrderFulfillmentTrackProps = {
  status: OrderStatus
  size?: 'compact' | 'full'
}

function stepClass(tone: ReturnType<typeof fulfillmentStepTone>, size: 'compact' | 'full') {
  const dim = size === 'compact' ? 'h-2 w-2' : 'h-3.5 w-3.5'
  switch (tone) {
    case 'done':
      return `${dim} bg-ink`
    case 'current':
      return `${dim} bg-cta shadow-[0_0_0_4px_color-mix(in_srgb,var(--cta-bg)_28%,transparent)]`
    case 'cancelled':
      return `${dim} bg-error/35`
    default:
      return `${dim} bg-border`
  }
}

function railClass(fromTone: ReturnType<typeof fulfillmentStepTone>) {
  if (fromTone === 'done') return 'bg-ink/70'
  if (fromTone === 'current') return 'bg-cta/45'
  if (fromTone === 'cancelled') return 'bg-error/20'
  return 'bg-border'
}

/** Visual delivery pipeline: New → Confirmed → Preparing → On the way → Done. */
export function OrderFulfillmentTrack({
  status,
  size = 'compact',
}: OrderFulfillmentTrackProps) {
  const { t } = useTranslation()

  if (status === 'draft') {
    return <KitchenStatusBadge status={status} />
  }

  if (status === 'cancelled') {
    return <KitchenStatusBadge status={status} />
  }

  return (
    <div className={size === 'full' ? 'w-full' : 'min-w-[168px]'}>
      <div className="flex items-center" aria-hidden>
        {FULFILLMENT_STEPS.map((step, index) => {
          const tone = fulfillmentStepTone(status, step)
          const last = index === FULFILLMENT_STEPS.length - 1
          return (
            <div key={step} className="flex min-w-0 flex-1 items-center last:flex-none">
              <span
                className={[
                  'inline-flex shrink-0 rounded-full',
                  stepClass(tone, size),
                  tone === 'current' ? 'order-step-now' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
              {last ? null : (
                <span
                  className={[
                    'mx-1 h-px min-w-[10px] flex-1',
                    size === 'full' ? 'mx-1.5 h-[2px]' : '',
                    railClass(tone),
                  ].join(' ')}
                />
              )}
            </div>
          )
        })}
      </div>

      {size === 'compact' ? (
        <p className="mt-1.5 m-0 text-[11px] font-extrabold leading-none text-ink">
          {t(`orders.status.${status}`)}
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-5 gap-1">
          {FULFILLMENT_STEPS.map((step: FulfillmentStep) => {
            const tone = fulfillmentStepTone(status, step)
            return (
              <span
                key={step}
                className={[
                  'text-center text-[10px] font-extrabold uppercase tracking-[0.04em]',
                  tone === 'current'
                    ? 'text-ink'
                    : tone === 'done'
                      ? 'text-sub'
                      : 'text-muted',
                ].join(' ')}
              >
                {t(`orders.steps.${step}`)}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
