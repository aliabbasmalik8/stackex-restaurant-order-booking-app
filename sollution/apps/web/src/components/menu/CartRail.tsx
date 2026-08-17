import { useCart } from '@/context/CartContext'
import { money, moneyFixed } from '@/utils/money'
import { localized } from '@/utils/localized'
import { useLanguage } from '@/i18n/LanguageContext'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui'

export function CartRail() {
  const { t } = useTranslation()
  const { locale } = useLanguage()
  const { items, itemCount, subtotal, vat, total, updateQuantity } = useCart()

  return (
    <aside className="flex w-[340px] shrink-0 flex-col bg-card shadow-[-1px_0_0_var(--divider)]">
      <div className="flex items-center justify-between px-6 pt-6">
        <h2 className="font-display text-[18px] font-bold tracking-tight">
          {t('cart.title')}
        </h2>
        <span className="rounded-pill bg-surface px-3 py-1 text-[11.5px] font-extrabold text-sub">
          {t('common.items', { count: itemCount })}
        </span>
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
                    <img src={line.image} alt="" className="size-full object-cover" />
                  ) : null}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[13.5px] font-extrabold">
                    {localized(locale, line.name, line.name_arabic)}
                  </span>
                  {line.optionsSummary ? (
                    <span className="text-[11.5px] font-semibold text-sub">
                      {localized(
                        locale,
                        line.optionsSummary,
                        line.optionsSummary_arabic,
                      )}
                    </span>
                  ) : null}
                  <div className="mt-1 flex items-center gap-2.5">
                    <div className="flex items-center gap-2.5 rounded-pill border-[1.5px] border-border px-2.5 py-0.5">
                      <button
                        type="button"
                        className="text-[13px] font-extrabold text-sub"
                        onClick={() => updateQuantity(line.id, line.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="text-[12.5px] font-extrabold">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        className="text-[13px] font-extrabold text-link"
                        onClick={() => updateQuantity(line.id, line.quantity + 1)}
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
          className="mt-1 flex h-[52px] items-center justify-center rounded-pill bg-cta text-[14.5px] font-extrabold text-on-primary shadow-cta disabled:opacity-45"
        >
          {t('cart.checkoutCta')}
        </button>
      </div>
    </aside>
  )
}
