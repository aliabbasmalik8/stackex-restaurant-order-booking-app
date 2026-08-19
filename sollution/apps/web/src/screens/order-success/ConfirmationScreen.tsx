import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Text } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useBrand } from '@/core/settings'
import { localized } from '@/utils/localized'
import { moneyFixed } from '@/utils/money'
import { useLanguage } from '@/i18n/LanguageContext'

function mapsUrl(address: string, lat?: number | null, lng?: number | null) {
  if (typeof lat === 'number' && typeof lng === 'number') {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

export function ConfirmationScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { locale } = useLanguage()
  const { lastOrder } = useCart()
  const { profile } = useAuth()
  const brand = useBrand()

  useEffect(() => {
    if (!lastOrder) {
      navigate('/menu', { replace: true })
    }
  }, [lastOrder, navigate])

  if (!lastOrder) return null

  const order = lastOrder
  const name = profile?.shortName ?? profile?.name ?? t('profile.fallbackName')
  const branchLabel = localized(
    locale,
    order.branchLabel,
    order.branchLabel_arabic,
  )
  const branchAddress = localized(locale, order.address, order.address_arabic)
  const paidLabel =
    order.paymentMethod === 'card'
      ? t('confirmation.paidCard')
      : t('confirmation.paidCash')

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-hero text-on-hero">
      <div className="pointer-events-none absolute -end-10 top-8 select-none font-display text-[180px] font-bold leading-none text-white/[0.05] sm:text-[280px]">
        {brand.monogram}
      </div>

      <div className="relative mx-auto flex min-h-0 w-full max-w-[1040px] flex-1 flex-col gap-10 overflow-y-auto px-6 py-10 sm:px-12 lg:flex-row lg:items-center lg:gap-10">
        <div className="flex min-w-0 flex-1 flex-col gap-3.5">
          <span className="grid size-[58px] place-items-center rounded-full bg-white/14 text-[26px]">
            ✓
          </span>
          <Text
            as="h1"
            variant="display"
            className="whitespace-pre-line text-[28px] leading-tight tracking-tight text-on-hero sm:text-[34px]"
          >
            {t('confirmation.heroTitle', { name })}
          </Text>
          <p className="max-w-[380px] text-[14.5px] font-semibold leading-relaxed text-white/70">
            {t('confirmation.heroSubtitle')}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/menu', { replace: true })}
              className="rounded-pill border-[1.5px] border-white/25 bg-white/14 px-6 py-3 text-[13px] font-extrabold text-on-hero"
            >
              {t('confirmation.backToMenu')}
            </button>
            {branchAddress ? (
              <a
                href={mapsUrl(branchAddress)}
                target="_blank"
                rel="noreferrer"
                className="rounded-pill border-[1.5px] border-white/25 bg-white/14 px-6 py-3 text-[13px] font-extrabold text-on-hero no-underline"
              >
                {t('confirmation.directions')}
              </a>
            ) : null}
          </div>
        </div>

        <div
          className="w-full shrink-0 rounded-[26px] p-7 shadow-[0_30px_70px_rgba(0,0,0,.35)] lg:w-[400px]"
          style={{
            background: 'var(--conf-card-bg)',
            color: 'var(--conf-card-text)',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold tracking-[0.1em] text-sub">
                {t('confirmation.pickupCode')}
              </span>
              <span className="font-display text-[40px] font-bold tracking-tight text-price">
                {order.orderCode}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-extrabold tracking-[0.1em] text-sub">
                {t('confirmation.readyAroundLabel')}
              </span>
              <span className="font-display text-[22px] font-bold">
                {order.readyAround ?? '—'}
              </span>
            </div>
          </div>

          <ol className="mt-[18px] flex flex-col">
            <li className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="grid size-[26px] place-items-center rounded-full bg-check text-[12px] font-extrabold text-check-text">
                  ✓
                </span>
                <span className="h-[26px] w-[2.5px] bg-check" />
              </div>
              <div className="pt-0.5">
                <p className="text-[13.5px] font-extrabold">
                  {t('confirmation.received')}
                </p>
                <p className="text-[11.5px] font-semibold text-sub">
                  {t('confirmation.justNow')}
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="grid size-[26px] place-items-center rounded-full bg-badge text-[11px] font-extrabold text-badge-text">
                  ●
                </span>
                <span className="h-[26px] w-[2.5px] bg-divider" />
              </div>
              <div className="pt-0.5">
                <p className="text-[13.5px] font-extrabold">
                  {t('confirmation.preparing')}
                </p>
                <p className="text-[11.5px] font-semibold text-sub">
                  {t('confirmation.happeningNow')}
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="size-[26px] rounded-full border-[2.5px] border-divider" />
              <div className="pt-0.5">
                <p className="text-[13.5px] font-extrabold text-muted">
                  {t('confirmation.ready')}
                </p>
                <p className="text-[11.5px] font-semibold text-muted">
                  {t('confirmation.weWillNotify')}
                </p>
              </div>
            </li>
          </ol>

          <div className="my-[18px] h-px bg-divider" />

          <div className="flex flex-col gap-2">
            {order.items.map((line) => (
              <div
                key={line.id}
                className="flex justify-between text-[12.5px] font-bold"
              >
                <span>
                  {line.quantity}×{' '}
                  {localized(locale, line.name, line.name_arabic)}
                </span>
                <span>{moneyFixed(line.unitPrice * line.quantity)}</span>
              </div>
            ))}
            <div className="mt-1 flex justify-between text-[14px] font-extrabold">
              <span>{paidLabel}</span>
              <span className="font-display text-price">
                {moneyFixed(order.total)}
              </span>
            </div>
          </div>

          <p className="mt-4 text-[12px] font-semibold text-sub">{branchLabel}</p>
        </div>
      </div>
    </div>
  )
}
