import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button, FormError, Text } from '@/components/ui'
import { AddressDropdown } from '@/components/layout/AddressDropdown'
import { StoreClosedBanner } from '@/components/menu/StoreClosedBanner'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { isPinCoveredByAnyBranch, useCatalog } from '@/core/catalog'
import {
  formatAddress,
  hasAddress,
  toCustomerAddress,
} from '@/core/profile'
import { useBrand, useStoreAvailability } from '@/core/settings'
import { useAddresses } from '@/api/OrderBooking/modules/addresses'
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
  const { branches } = useCatalog()
  const { data: addresses = [] } = useAddresses(true)
  const {
    items,
    itemCount,
    subtotal,
    vat,
    total,
    placeOrder,
    removeItemsByMenuItemIds,
  } = useCart()

  const [pay, setPay] = useState<CheckoutPayMethod>('cash')
  const [phoneLocal, setPhoneLocal] = useState(() =>
    localPhoneDigits(profile?.phone, brand.dialCode),
  )
  const [placing, setPlacing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [addressOpen, setAddressOpen] = useState(false)

  const displayName =
    profile?.shortName ?? profile?.name ?? t('profile.fallbackName')
  const defaultSaved =
    addresses.find((row) => row.isDefault) ?? addresses[0] ?? null
  const orderAddress = defaultSaved
    ? toCustomerAddress(defaultSaved)
    : null
  const addressReady = hasAddress(orderAddress)

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
    if (!orderAddress || !hasAddress(orderAddress)) {
      setErrorMessage(t('checkout.addressRequired'))
      return
    }
    const payloadPin =
      typeof orderAddress.lat === 'number' &&
      Number.isFinite(orderAddress.lat) &&
      typeof orderAddress.lng === 'number' &&
      Number.isFinite(orderAddress.lng)
        ? { lat: orderAddress.lat, lng: orderAddress.lng }
        : null
    if (!isPinCoveredByAnyBranch(payloadPin, branches)) {
      setErrorMessage(
        t(
          errorMessageKey(
            payloadPin ? 'out_of_delivery_range' : 'delivery_address_required',
          ),
        ),
      )
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
          address: orderAddress,
          paymentMethod,
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
            <h2 className="font-display text-[16.5px] font-bold tracking-tight">
              {t('checkout.yourInfo')}
            </h2>
            <div className="mt-4 flex flex-col gap-4 rounded-[16px] bg-surface p-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-extrabold text-sub">
                  {t('checkout.name')}
                </span>
                <div className="flex h-12 items-center justify-between gap-3 rounded-[12px] border border-border bg-card px-4">
                  <span className="truncate text-[14.5px] font-bold">
                    {displayName}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="shrink-0 text-[12.5px] font-extrabold text-link"
                  >
                    {t('common.edit')}
                  </button>
                </div>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-extrabold text-sub">
                  {t('checkout.phone')}
                </span>
                <div className="flex h-12 items-center gap-2 rounded-[12px] border border-border bg-card px-4">
                  <span className="shrink-0 text-[14.5px] font-bold text-sub">
                    {brand.dialCode}
                  </span>
                  <input
                    value={phoneLocal}
                    onChange={(e) => setPhoneLocal(e.target.value)}
                    placeholder={t('auth.phonePlaceholder')}
                    inputMode="tel"
                    className="h-full min-w-0 flex-1 bg-transparent text-[14.5px] font-bold text-ink outline-none placeholder:font-semibold placeholder:text-muted"
                  />
                </div>
              </label>

              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] font-extrabold text-sub">
                  {t('checkout.address')}
                </span>
                <button
                  type="button"
                  onClick={() => setAddressOpen(true)}
                  className="flex min-h-12 items-start justify-between gap-3 rounded-[12px] border border-border bg-card px-4 py-3 text-start"
                >
                  {addressReady && defaultSaved && orderAddress ? (
                    <span className="min-w-0">
                      <span className="block truncate text-[14.5px] font-bold">
                        {defaultSaved.label}
                      </span>
                      <span className="mt-0.5 block text-[12.5px] font-semibold leading-snug text-sub">
                        {formatAddress(orderAddress)}
                      </span>
                    </span>
                  ) : (
                    <span className="text-[14px] font-semibold text-muted">
                      {t('checkout.addressMissing')}
                    </span>
                  )}
                  <span className="shrink-0 pt-0.5 text-[12.5px] font-extrabold text-link">
                    {addressReady ? t('common.edit') : t('checkout.addressAdd')}
                  </span>
                </button>
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
              <div key={line.id} className="flex items-center gap-3">
                <div className="size-12 shrink-0 overflow-hidden rounded-[10px] bg-placeholder">
                  {line.image ? (
                    <img
                      src={line.image}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-extrabold">
                    {localized(locale, line.name, line.name_arabic)}
                  </p>
                  <p className="text-[12px] font-semibold text-sub">
                    {line.quantity}×
                    {line.optionsSummary
                      ? ` · ${localized(
                          locale,
                          line.optionsSummary,
                          line.optionsSummary_arabic,
                        )}`
                      : ''}
                  </p>
                </div>
                <span className="shrink-0 font-display text-[13.5px] font-bold text-price">
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
            <FormError
              message={errorMessage ?? (isClosed ? closedMessage : null)}
            />
            <Button
              label={
                isClosed ? t('store.closedCta') : t('checkout.placeOrderCta')
              }
              onClick={onPlaceOrder}
              loading={placing}
              disabled={placing || isClosed}
              className="w-full"
            />
            <p className="flex items-center justify-center gap-1.5 text-[11.5px] font-semibold text-muted">
              <span aria-hidden>🔒</span>
              {t('checkout.secureCheckout')}
            </p>
          </div>
        </aside>
      </div>

      <AddressDropdown
        hideTrigger
        open={addressOpen}
        onOpenChange={setAddressOpen}
      />
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
    </header>
  )
}
