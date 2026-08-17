import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StateMessage } from '@/components/ui'
import { AppHeader } from '@/components/layout/AppHeader'
import { CartRail } from '@/components/menu/CartRail'
import { MenuItemCard } from '@/components/menu/MenuItemCard'
import { MenuSkeleton } from '@/components/menu/MenuSkeleton'
import { StoreClosedBanner } from '@/components/menu/StoreClosedBanner'
import { useCart } from '@/context/CartContext'
import { useCatalog } from '@/core/catalog'
import { useBrand, useStoreAvailability } from '@/core/settings'
import { localized } from '@/utils/localized'
import { useLanguage } from '@/i18n/LanguageContext'

function formatReadyAround(minutes: number): string {
  const d = new Date(Date.now() + minutes * 60_000)
  return d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function MenuScreen() {
  const { t } = useTranslation()
  const { locale } = useLanguage()
  const brand = useBrand()
  const { isClosed } = useStoreAvailability()
  const { categories, items: menuItems, primaryBranch, isLoading, errorCode, error, refetch } =
    useCatalog()
  const { addItem } = useCart()
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')

  const etaMinutes = primaryBranch?.etaMinutes ?? 15
  const readyTime = formatReadyAround(etaMinutes)

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    return menuItems.filter((item) => {
      if (category !== 'all' && item.categoryId !== category) return false
      if (!q) return true
      const name = localized(locale, item.name, item.name_arabic)
      const description = localized(
        locale,
        item.description,
        item.description_arabic,
      )
      return (
        name.toLowerCase().includes(q) ||
        description.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.name_arabic.includes(q)
      )
    })
  }, [menuItems, category, query, locale])

  const chipCategories = useMemo(
    () => [
      { id: 'all', label: t('menu.categories.all') },
      ...categories.map((c) => ({
        id: c.id,
        label: localized(locale, c.label, c.label_arabic),
      })),
    ],
    [categories, locale, t],
  )

  const activeCategoryLabel =
    chipCategories.find((c) => c.id === category)?.label ?? ''

  const addSimpleItem = (id: string) => {
    const item = menuItems.find((row) => row.id === id)
    if (!item) return
    addItem({
      menuItemId: item.id,
      name: item.name,
      name_arabic: item.name_arabic,
      image: item.image,
      unitPrice: item.price,
      optionsSummary: '',
      optionsSummary_arabic: '',
      selectedOptionIds: [],
    })
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-page">
      <AppHeader search={query} onSearchChange={setQuery} />

      <div className="flex min-h-0 flex-1">
        <nav className="flex w-[216px] shrink-0 flex-col gap-1 pt-[26px] ps-9">
          <span className="px-3.5 pb-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-muted">
            {t('menu.navLabel')}
          </span>
          {chipCategories.map((chip) => {
            const active = chip.id === category
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setCategory(chip.id)}
                className={[
                  'rounded-[13px] px-3.5 py-[11px] text-start text-[13.5px]',
                  active
                    ? 'bg-sel font-extrabold text-sel-text'
                    : 'font-bold text-sub hover:bg-surface',
                ].join(' ')}
              >
                {chip.label}
              </button>
            )
          })}
        </nav>

        <div className="flex min-w-0 flex-1 flex-col gap-5 overflow-y-auto px-8 pb-8 pt-[26px]">
          <div className="relative flex items-center justify-between overflow-hidden rounded-[22px] bg-hero px-[30px] py-[26px] text-on-hero">
            <div className="pointer-events-none absolute -end-5 -top-8 select-none font-display text-[130px] font-bold leading-none text-white/[0.07]">
              {brand.monogram}
            </div>
            <div className="relative flex flex-col gap-1">
              <span className="font-display text-[22px] font-bold tracking-tight">
                {t('menu.heroTitle')}
              </span>
              <span className="text-[13.5px] font-semibold text-white/75">
                {t('menu.heroSubtitle')}
              </span>
            </div>
            <span className="relative rounded-pill border-[1.5px] border-white/25 bg-white/14 px-5 py-[11px] text-[12.5px] font-extrabold">
              ⚡ {t('menu.readyAround', { time: readyTime })}
            </span>
          </div>

          {isClosed ? <StoreClosedBanner /> : null}

          {isLoading ? (
            <MenuSkeleton />
          ) : errorCode ? (
            <div className="flex flex-1 items-center justify-center">
              <StateMessage
                errorCode={errorCode}
                error={error}
                onAction={
                  errorCode === 'empty' ? undefined : () => void refetch()
                }
              />
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-[19px] font-bold tracking-tight">
                  {activeCategoryLabel}
                </h2>
                <span className="text-[12.5px] font-extrabold text-link">
                  {t('menu.itemCount', { count: items.length })}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAdd={() => addSimpleItem(item.id)}
                    orderingDisabled={isClosed}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <CartRail />
      </div>
    </div>
  )
}
