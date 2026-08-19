import { useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'
import { money, moneyFixed } from '@/utils/money'
import { localized } from '@/utils/localized'
import { useLanguage } from '@/i18n/LanguageContext'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui'

function CartPanel({
  onCheckout,
  onClose,
}: {
  onCheckout?: () => void
  onClose?: () => void
}) {
  const { t } = useTranslation()
  const { locale } = useLanguage()
  const { items, itemCount, subtotal, vat, total, updateQuantity } = useCart()
  const [promo, setPromo] = useState('')
  const [promoHint, setPromoHint] = useState<string | null>(null)

  return (
    <aside className="flex h-full min-h-0 w-full flex-col bg-card">
      <div className="flex items-center justify-between px-6 pt-6">
        <h2 className="font-display text-[18px] font-bold tracking-tight">
          {t('cart.title')}
        </h2>
        <div className="flex items-center gap-2">
          <span className="rounded-pill bg-surface px-3 py-1 text-[11.5px] font-extrabold text-sub">
            {t('common.items', { count: itemCount })}
          </span>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="grid size-8 place-items-center rounded-full bg-surface text-sub"
              aria-label={t('common.close')}
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-6 py-[18px]">
        {items.length === 0 ? (
          <Text variant="subtitle" className="text-sub">
            {t('cart.empty')}
          </Text>
        ) : (
          items.map((line, index) => (
            <div key={line.id}>
              {index > 0 ? <div className="mb-3.5 h-px bg-divider" /> : null}
              <div className="flex gap-3">
                <div className="size-[52px] shrink-0 overflow-hidden rounded-[14px] bg-placeholder">
                  {line.image ? (
                    <img
                      src={line.image}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[13.5px] font-extrabold">
                    {localized(locale, line.name, line.name_arabic)}
                  </span>
                  {line.optionsSummary || line.specialInstructions ? (
                    <span className="text-[11.5px] font-semibold text-sub">
                      {[
                        localized(
                          locale,
                          line.optionsSummary,
                          line.optionsSummary_arabic,
                        ),
                        line.specialInstructions,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  ) : null}
                  <div className="mt-1 flex items-center gap-2.5">
                    <div className="flex items-center gap-2.5 rounded-pill border-[1.5px] border-border px-2.5 py-0.5">
                      <button
                        type="button"
                        className="text-[13px] font-extrabold text-sub"
                        onClick={() =>
                          updateQuantity(line.id, line.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span className="text-[12.5px] font-extrabold">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        className="text-[13px] font-extrabold text-link"
                        onClick={() =>
                          updateQuantity(line.id, line.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <span className="ms-auto font-display text-[13.5px] font-bold text-price">
                      {money(line.unitPrice * line.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        <div className="mt-auto rounded-[14px] bg-surface px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <span aria-hidden>🏷️</span>
            <input
              value={promo}
              onChange={(e) => {
                setPromo(e.target.value)
                setPromoHint(null)
              }}
              placeholder={t('cart.addPromo')}
              className="min-w-0 flex-1 bg-transparent text-[12.5px] font-bold text-ink outline-none placeholder:text-sub"
            />
            <button
              type="button"
              className="text-[12px] font-extrabold text-link"
              onClick={() => setPromoHint(t('cart.promoUnavailable'))}
            >
              {t('cart.apply')}
            </button>
          </div>
          {promoHint ? (
            <p className="mt-2 text-[11.5px] font-semibold text-sub">
              {promoHint}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2.5 px-6 pb-6 pt-[18px] shadow-[0_-1px_0_var(--divider)]">
        <div className="flex justify-between text-[13px] font-semibold text-sub">
          <span>{t('cart.subtotal')}</span>
          <span>{moneyFixed(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[13px] font-semibold text-sub">
          <span>{t('cart.vat')}</span>
          <span>{moneyFixed(vat)}</span>
        </div>
        <div className="flex justify-between text-[15.5px] font-extrabold">
          <span>{t('cart.total')}</span>
          <span className="font-display text-price">{moneyFixed(total)}</span>
        </div>
        <button
          type="button"
          disabled={itemCount === 0}
          onClick={onCheckout}
          className="mt-1 flex h-[52px] items-center justify-center rounded-pill bg-cta text-[14.5px] font-extrabold text-on-primary shadow-cta disabled:opacity-45"
        >
          {t('cart.checkoutCta')}
        </button>
      </div>
    </aside>
  )
}

/** Docked cart column on wide layouts. */
export function CartRail({ onCheckout }: { onCheckout?: () => void }) {
  return (
    <div className="hidden h-full w-[280px] shrink-0 wide:flex">
      <CartPanel onCheckout={onCheckout} />
    </div>
  )
}

/** Sticky checkout bar in the menu column (below 1100px). */
export function CartMenuBar({ onCheckout }: { onCheckout: () => void }) {
  const { t } = useTranslation()
  const { itemCount, total } = useCart()
  if (itemCount === 0) return null

  return (
    <div className="wide:hidden shrink-0 border-t border-black/10 bg-card px-6 py-3 sm:px-10">
      <button
        type="button"
        onClick={onCheckout}
        className="flex h-[52px] w-full items-center justify-between rounded-pill bg-cta px-6 text-on-primary shadow-cta"
      >
        <span className="text-[14.5px] font-extrabold">
          {t('checkout.title')}
        </span>
        <span className="rounded-pill bg-white/16 px-3.5 py-1.5 text-[13px] font-extrabold">
          {t('common.items', { count: itemCount })} · {moneyFixed(total)}
        </span>
      </button>
    </div>
  )
}

/** Overlay cart for compact layouts. Backdrop is viewport-wide. */
export function CartOverlay({
  open,
  onClose,
  onCheckout,
}: {
  open: boolean
  onClose: () => void
  onCheckout?: () => void
}) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 wide:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        aria-label={t('common.close')}
        onClick={onClose}
      />
      <div
        id="cart-sidebar"
        role="dialog"
        aria-label={t('cart.title')}
        className="absolute inset-y-0 end-0 flex w-[280px] max-w-full shadow-card-hover"
      >
        <CartPanel onCheckout={onCheckout} onClose={onClose} />
      </div>
    </div>
  )
}
