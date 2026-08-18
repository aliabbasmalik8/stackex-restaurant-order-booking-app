import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StateMessage } from '@/components/ui'
import { AppHeader } from '@/components/layout/AppHeader'
import { CartRail, MobileCartBar } from '@/components/menu/CartRail'
import { ItemCustomizeModal } from '@/components/item/ItemCustomizeModal'
import { MenuItemCard } from '@/components/menu/MenuItemCard'
import { MenuSkeleton } from '@/components/menu/MenuSkeleton'
import { StoreClosedBanner } from '@/components/menu/StoreClosedBanner'
import { useAuth } from '@/context/AuthContext'
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
  const navigate = useNavigate()
  const { requireAuth } = useAuth()
  const brand = useBrand()
  const { isClosed } = useStoreAvailability()
  const {
    categories,
    items: menuItems,
    primaryBranch,
    isLoading,
    errorCode,
    error,
    refetch,
  } = useCatalog()
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [params, setParams] = useSearchParams()
  const itemId = params.get('item')

  const etaMinutes = primaryBranch?.etaMinutes ?? 15
  const readyTime = formatReadyAround(etaMinutes)

  const openItem = (id: string) => {
    const next = new URLSearchParams(params)
    next.set('item', id)
    setParams(next, { replace: false })
  }

  const closeItem = () => {
    const next = new URLSearchParams(params)
    next.delete('item')
    setParams(next, { replace: true })
  }

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

  const goCheckout = () => {
    if (!requireAuth('/menu')) {
      navigate('/sign-in')
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-page">
      <AppHeader search={query} onSearchChange={setQuery} />

      <div className="flex min-h-0 flex-1">
        <nav className="hidden w-[216px] shrink-0 flex-col gap-1 pt-[26px] ps-9 lg:flex">
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

        <div className="flex min-w-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pb-24 pt-5 sm:px-8 sm:pt-[26px] xl:pb-8">
          <label className="flex h-11 items-center gap-2.5 rounded-pill bg-card px-[18px] text-muted shadow-card sm:hidden">
            <span aria-hidden>⌕</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('menu.searchPlaceholder')}
              className="h-full w-full bg-transparent text-[13.5px] font-semibold text-ink outline-none placeholder:text-muted"
            />
          </label>

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 lg:hidden">
            {chipCategories.map((chip) => {
              const active = chip.id === category
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setCategory(chip.id)}
                  className={[
                    'shrink-0 rounded-pill px-4 py-2 text-[13px]',
                    active
                      ? 'bg-sel font-extrabold text-sel-text'
                      : 'bg-card font-bold text-sub shadow-card',
                  ].join(' ')}
                >
                  {chip.label}
                </button>
              )
            })}
          </div>

          <div className="relative flex items-center justify-between overflow-hidden rounded-[22px] bg-hero px-5 py-5 text-on-hero sm:px-[30px] sm:py-[26px]">
            <div className="pointer-events-none absolute -end-5 -top-8 select-none font-display text-[130px] font-bold leading-none text-white/[0.07]">
              {brand.monogram}
            </div>
            <div className="relative flex flex-col gap-1">
              <span className="font-display text-[18px] font-bold tracking-tight sm:text-[22px]">
                {t('menu.heroTitle')}
              </span>
              <span className="text-[13px] font-semibold text-white/75 sm:text-[13.5px]">
                {t('menu.heroSubtitle')}
              </span>
            </div>
            <span className="relative hidden rounded-pill border-[1.5px] border-white/25 bg-white/14 px-5 py-[11px] text-[12.5px] font-extrabold sm:inline">
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

              {items.length === 0 ? (
                <p className="text-[13.5px] font-semibold text-sub">
                  {t('menu.noResults')}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onOpen={() => openItem(item.id)}
                      orderingDisabled={isClosed}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <CartRail className="max-xl:hidden" onCheckout={goCheckout} />
      </div>

      <MobileCartBar onOpen={() => setCartOpen(true)} />

      {cartOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/40 xl:hidden"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="absolute inset-x-0 bottom-0 flex max-h-[88vh] overflow-hidden rounded-t-[26px]"
            onClick={(e) => e.stopPropagation()}
          >
            <CartRail
              onCheckout={goCheckout}
              onClose={() => setCartOpen(false)}
              className="max-h-[88vh]"
            />
          </div>
        </div>
      ) : null}

      <ItemCustomizeModal itemId={itemId} onClose={closeItem} />
    </div>
  )
}
