import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button, FormError, Text } from '@/components/ui'
import { StoreClosedBanner } from '@/components/menu/StoreClosedBanner'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { pickupCustomerAddress, useCatalog } from '@/core/catalog'
import { useBrand, useStoreAvailability } from '@/core/settings'
import {
  CheckoutPaymentSection,
  resolveCheckoutPaymentMethod,
  type CheckoutPayMethod,
} from '@/feature-ui/stripe-payment'
import { ApiError } from '@/api/OrderBooking/client'
import {
  errorMessageKey,
  getErrorMessage,
  toAppError,
} from '@/lib/errors'
import { localized } from '@/utils/localized'
import { money, moneyFixed } from '@/utils/money'
import { useLanguage } from '@/i18n/LanguageContext'
import { buildPickupSlots, formatReadyAround } from './pickupSlots'

function localPhoneDigits(
  stored: string | null | undefined,
  dialCode: string,
): string {
  const raw = stored?.trim() ?? ''
  if (!raw) return ''
  const dial = dialCode.replace('+', '')
  if (raw.startsWith(dialCode)) return raw.slice(dialCode.length).trim()
  if (raw.startsWith(`+${dial}`)) return raw.slice(dial.length + 1).trim()
  if (raw.startsWith('00' + dial)) return raw.slice(dial.length + 2).trim()
  return raw
}

function toFullPhone(local: string, dialCode: string): string {
  const digits = local.replace(/[\s-]/g, '')
  if (!digits) return ''
  if (digits.startsWith('+')) return digits
  return `${dialCode}${digits}`
}

export function CheckoutScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { locale } = useLanguage()
  const { profile, updateUserProfile } = useAuth()
  const brand = useBrand()
  const { isClosed, closedMessage } = useStoreAvailability()
  const { primaryBranch, branches } = useCatalog()
  const {
    items,
    itemCount,
    subtotal,
    vat,
    total,
    placeOrder,
    removeItemsByMenuItemIds,
  } = useCart()

  const [when, setWhen] = useState<'asap' | 'schedule'>('asap')
  const [slotId, setSlotId] = useState<string | null>(null)
  const [pay, setPay] = useState<CheckoutPayMethod>('cash')
  const [phoneLocal, setPhoneLocal] = useState(() =>
    localPhoneDigits(profile?.phone, brand.dialCode),
  )
  const [placing, setPlacing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const etaMinutes = primaryBranch?.etaMinutes ?? 15
  const asapTime = formatReadyAround(new Date(), etaMinutes, locale)
  const slots = useMemo(
    () => buildPickupSlots(etaMinutes, locale),
    [etaMinutes, locale],
  )
  const selectedSlot = slots.find((slot) => slot.id === slotId) ?? slots[0]
  const readyAround =
    when === 'asap' ? asapTime : (selectedSlot?.readyAround ?? asapTime)

  const displayName =
    profile?.shortName ?? profile?.name ?? t('profile.fallbackName')
  const pickupAddress = pickupCustomerAddress(primaryBranch, branches)
  const branchName = primaryBranch
    ? localized(locale, primaryBranch.name, primaryBranch.name_arabic)
    : brand.name
  const branchAddress = primaryBranch
    ? localized(locale, primaryBranch.address, primaryBranch.address_arabic)
    : ''

  const onPlaceOrder = () => {
    if (isClosed) {
      setErrorMessage(closedMessage)
      return
    }
    if (itemCount === 0 || placing) {
      if (itemCount === 0) navigate('/menu', { replace: true })
      return
    }
    const phone = toFullPhone(phoneLocal, brand.dialCode)
    if (!phone) {
      setErrorMessage(t('checkout.phoneRequired'))
      return
    }

    void (async () => {
      setPlacing(true)
      setErrorMessage(null)
      try {
        if (phone !== (profile?.phone?.trim() ?? '')) {
          await updateUserProfile({ contactPhone: phone })
        }
        const paymentMethod = resolveCheckoutPaymentMethod(pay)
        const order = await placeOrder({
          name: displayName,
          phone,
          address: pickupAddress ?? { line1: '', city: '' },
          paymentMethod,
          readyAround,
        })
        if (paymentMethod === 'card') {
          navigate('/payment', { replace: true, state: { orderId: order.id } })
          return
        }
        navigate('/order-success', { replace: true })
      } catch (error) {
        if (error instanceof ApiError && error.status === 503) {
          setErrorMessage(
            getErrorMessage(error, error.message || closedMessage),
          )
        } else {
          const appError = toAppError(error)
          if (
            appError.code === 'item_unavailable' &&
            appError.unavailableMenuItemIds?.length
          ) {
            removeItemsByMenuItemIds(appError.unavailableMenuItemIds)
          }
          const fallback =
            appError.code === 'store_closed'
              ? closedMessage || t(errorMessageKey(appError.code))
              : t(errorMessageKey(appError.code))
          setErrorMessage(getErrorMessage(error, fallback))
        }
      } finally {
        setPlacing(false)
      }
    })()
  }

  if (itemCount === 0) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-page">
        <CheckoutHeader onBack={() => navigate('/menu')} />
        <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col gap-4 px-6 py-10">
          <Text variant="title">{t('cart.empty')}</Text>
          <Button
            label={t('orders.browseMenu')}
            onClick={() => navigate('/menu')}
            className="w-fit"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-page">
      <CheckoutHeader onBack={() => navigate(-1)} />

      <div className="mx-auto flex min-h-0 w-full max-w-[1120px] flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 sm:px-9 lg:flex-row lg:items-start lg:gap-[26px] lg:py-[30px]">
        <div className="flex min-w-0 flex-[1.5] flex-col gap-5">
          {isClosed ? <StoreClosedBanner /> : null}

          <section className="rounded-[22px] bg-card p-6 shadow-card">
            <div className="flex items-center gap-2.5">
              <span className="grid size-[30px] place-items-center rounded-[10px] bg-surface text-sm">
                🕐
              </span>
              <h2 className="font-display text-[16.5px] font-bold tracking-tight">
                {t('checkout.when')}
              </h2>
            </div>
            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={() => setWhen('asap')}
                className={[
                  'flex flex-1 flex-col gap-0.5 rounded-2xl px-[18px] py-[15px] text-start',
                  when === 'asap'
                    ? 'bg-sel text-sel-text shadow-card'
                    : 'border-2 border-border',
                ].join(' ')}
              >
                <span className="text-[14px] font-extrabold">
                  {t('checkout.asap')}
                </span>
                <span className="text-[11.5px] font-bold opacity-75">
                  {t('checkout.asapReady', {
                    time: asapTime,
                    minutes: etaMinutes,
                  })}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setWhen('schedule')
                  if (!slotId && selectedSlot) setSlotId(selectedSlot.id)
                }}
                className={[
                  'flex flex-1 flex-col gap-0.5 rounded-2xl px-[18px] py-[15px] text-start',
                  when === 'schedule'
                    ? 'bg-sel text-sel-text shadow-card'
                    : 'border-2 border-border',
                ].join(' ')}
              >
                <span className="text-[14px] font-extrabold">
                  {t('checkout.schedule')}
                </span>
                <span
                  className={[
                    'text-[11.5px] font-bold',
                    when === 'schedule' ? 'opacity-75' : 'text-sub',
                  ].join(' ')}
                >
                  {t('checkout.scheduleHint')}
                </span>
              </button>
            </div>
            {when === 'schedule' ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {slots.map((slot) => {
                  const active = slot.id === (slotId ?? selectedSlot?.id)
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSlotId(slot.id)}
                      className={[
                        'rounded-pill px-4 py-2 text-[12px] font-extrabold',
                        active
                          ? 'bg-sel text-sel-text'
                          : 'border-[1.5px] border-border text-sub',
                      ].join(' ')}
                    >
                      {slot.label}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </section>

          <section className="rounded-[22px] bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[16.5px] font-bold tracking-tight">
                {t('checkout.yourInfo')}
              </h2>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="text-[12.5px] font-extrabold text-link"
              >
                {t('common.edit')}
              </button>
            </div>
            <div className="mt-4 overflow-hidden rounded-[16px] bg-surface">
              <div className="flex items-center justify-between border-b border-divider px-[17px] py-[15px]">
                <span className="text-[13.5px] font-semibold text-sub">
                  {t('checkout.name')}
                </span>
                <span className="text-[14px] font-extrabold">{displayName}</span>
              </div>
              <div className="flex items-center justify-between gap-3 px-[17px] py-[15px]">
                <span className="text-[13.5px] font-semibold text-sub">
                  {t('checkout.phone')}
                </span>
                <div className="flex min-w-0 items-center justify-end gap-1.5">
                  <span className="text-[14px] font-extrabold">
                    {brand.dialCode}
                  </span>
                  <input
                    value={phoneLocal}
                    onChange={(e) => setPhoneLocal(e.target.value)}
                    placeholder={t('auth.phonePlaceholder')}
                    inputMode="tel"
                    className="w-[140px] bg-transparent text-end text-[14px] font-extrabold text-ink outline-none placeholder:font-semibold placeholder:text-muted"
                  />
                </div>
              </div>
            </div>
            <p className="mt-2.5 text-[11.5px] font-semibold text-muted">
              {t('checkout.whatsappHint')}
            </p>
          </section>

          <CheckoutPaymentSection pay={pay} onChange={setPay} />
        </div>

        <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-[380px]">
          <div className="flex flex-col gap-3.5 rounded-[22px] bg-card p-6 shadow-card">
            <h2 className="font-display text-[16.5px] font-bold tracking-tight">
              {t('checkout.summary')}
            </h2>
            {items.map((line) => (
              <div
                key={line.id}
                className="flex justify-between gap-3 text-[13px] font-bold"
              >
                <span>
                  {line.quantity}×{' '}
                  {localized(locale, line.name, line.name_arabic)}
                  {line.optionsSummary ? (
                    <span className="font-semibold text-muted">
                      {' '}
                      ·{' '}
                      {localized(
                        locale,
                        line.optionsSummary,
                        line.optionsSummary_arabic,
                      )}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 font-display text-price">
                  {money(line.unitPrice * line.quantity)}
                </span>
              </div>
            ))}
            <div className="h-px bg-divider" />
            <div className="flex justify-between text-[13px] font-semibold text-sub">
              <span>{t('cart.subtotal')}</span>
              <span>{moneyFixed(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[13px] font-semibold text-sub">
              <span>{t('cart.vat')}</span>
              <span>{moneyFixed(vat)}</span>
            </div>
            <div className="flex justify-between text-[16px] font-extrabold">
              <span>{t('cart.total')}</span>
              <span className="font-display text-price">{moneyFixed(total)}</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-[14px] bg-surface px-3.5 py-3">
              <span aria-hidden>📍</span>
              <div className="flex min-w-0 flex-col">
                <span className="text-[12px] font-extrabold">
                  {brand.name}
                  {branchName ? ` — ${branchName}` : ''}
                </span>
                {branchAddress ? (
                  <span className="text-[11px] font-semibold text-sub">
                    {branchAddress}
                  </span>
                ) : null}
              </div>
            </div>
            <FormError
              message={errorMessage ?? (isClosed ? closedMessage : null)}
            />
            <Button
              label={
                isClosed
                  ? t('store.closedCta')
                  : t('checkout.placeOrderTotal', { total: moneyFixed(total) })
              }
              onClick={onPlaceOrder}
              loading={placing}
              disabled={placing || isClosed}
              className="w-full"
            />
            <p className="text-center text-[11.5px] font-semibold text-muted">
              {t('checkout.codeHint')}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function CheckoutHeader({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation()
  return (
    <header className="flex shrink-0 items-center gap-4 bg-card px-4 py-4 shadow-[0_1px_0_var(--divider)] sm:px-9">
      <button
        type="button"
        onClick={onBack}
        className="grid size-[38px] place-items-center rounded-full bg-surface text-[17px] text-ink"
        aria-label={t('common.back')}
      >
        ‹
      </button>
      <h1 className="font-display text-[17px] font-bold tracking-tight">
        {t('checkout.title')}
      </h1>
      <div className="ms-auto hidden items-center gap-2 text-[12px] font-extrabold text-sub sm:flex">
        <span className="text-link">{t('checkout.crumbCart')}</span>
        <span>›</span>
        <span className="text-ink">{t('checkout.crumbPay')}</span>
        <span>›</span>
        <span className="text-muted">{t('checkout.crumbDone')}</span>
      </div>
    </header>
  )
}
