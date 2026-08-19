import { money } from '@/utils/money'
import type { MenuItem } from '@/core/catalog'
import { localized } from '@/utils/localized'
import { useLanguage } from '@/i18n/LanguageContext'
import { useTranslation } from 'react-i18next'

export function MenuItemCard({
  item,
  onOpen,
  orderingDisabled,
}: {
  item: MenuItem
  onOpen: () => void
  orderingDisabled?: boolean
}) {
  const { t } = useTranslation()
  const { locale } = useLanguage()
  const name = localized(locale, item.name, item.name_arabic)
  const description = localized(locale, item.description, item.description_arabic)
  const badge = localized(locale, item.badge ?? '', item.badge_arabic)
  const unavailable = orderingDisabled || item.available === false

  return (
    <article
      className="flex cursor-pointer flex-col overflow-hidden rounded-[20px] bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
      onClick={onOpen}
    >
      <div className="h-[140px] overflow-hidden bg-placeholder">
        {item.image ? (
          <img src={item.image} alt="" className="size-full object-cover" />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 px-[17px] pb-[17px] pt-[15px]">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-extrabold text-ink">{name}</h3>
          {item.featured || badge ? (
            <span className="rounded-pill bg-badge px-2 py-[3px] text-[9.5px] font-extrabold uppercase text-badge-text">
              {badge || t('menu.popular')}
            </span>
          ) : null}
        </div>
        <p className="line-clamp-2 text-[12.5px] font-semibold leading-snug text-sub">
          {description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-[15px] font-bold text-price">
            {money(item.price)}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onOpen()
            }}
            disabled={unavailable}
            aria-label={t('menu.addItem', { name })}
            className="grid size-[34px] place-items-center rounded-full bg-cta text-[17px] font-extrabold text-on-primary disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>
    </article>
  )
}
