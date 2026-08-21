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
  const dim = size === 'compact' ? 'size-7 text-[10px]' : 'size-9 text-xs'
  switch (tone) {
    case 'done':
      return `${dim} border border-ink bg-ink text-card`
    case 'current':
      return `${dim} border border-cta bg-cta text-on-primary shadow-[0_0_0_4px_color-mix(in_srgb,var(--cta-bg)_28%,transparent)]`
    case 'cancelled':
      return `${dim} border border-error/40 bg-error/10 text-error`
    default:
      return `${dim} border border-border bg-surface text-muted`
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
    <div className={size === 'full' ? 'w-full' : 'min-w-42'}>
      <div className="flex items-center" aria-hidden>
        {FULFILLMENT_STEPS.map((step, index) => {
          const tone = fulfillmentStepTone(status, step)
          const last = index === FULFILLMENT_STEPS.length - 1
          return (
            <div key={step} className="flex min-w-0 flex-1 items-center last:flex-none">
              <span
                className={[
                  'inline-flex shrink-0 items-center justify-center rounded-full font-extrabold leading-none transition-[background-color,border-color,color,box-shadow] duration-200',
                  stepClass(tone, size),
                  tone === 'current' ? 'order-step-now' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {tone === 'done' ? '✓' : index + 1}
              </span>
              {last ? null : (
                <span
                  className={[
                    'mx-1 h-px min-w-2.5 flex-1',
                    size === 'full' ? 'mx-1.5 h-0.5' : '',
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
