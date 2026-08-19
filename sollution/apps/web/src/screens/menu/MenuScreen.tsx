import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DineOsMark, StateMessage } from '@/components/ui'
import { AppHeader } from '@/components/layout/AppHeader'
import { CartMenuBar, CartOverlay, CartRail } from '@/components/menu/CartRail'
import { CategoryChipScroller } from '@/components/menu/CategoryChipScroller'
import { ItemCustomizeModal } from '@/components/item/ItemCustomizeModal'
import { MenuItemCard } from '@/components/menu/MenuItemCard'
import { MenuSkeleton } from '@/components/menu/MenuSkeleton'
import { StoreClosedBanner } from '@/components/menu/StoreClosedBanner'
import { useAuth } from '@/context/AuthContext'
import { useCatalog } from '@/core/catalog'
import { useStoreAvailability } from '@/core/settings'
import { localized } from '@/utils/localized'
import { useLanguage } from '@/i18n/LanguageContext'

const SIDE_NAV_MIN_PX = 700

function useMinWidth(px: number) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined'
      ? false
      : window.matchMedia(`(min-width: ${px}px)`).matches,
  )

  useEffect(() => {
    const media = window.matchMedia(`(min-width: ${px}px)`)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [px])

  return matches
}

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
  const showSideNav = useMinWidth(SIDE_NAV_MIN_PX)

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
    setCartOpen(false)
    if (!requireAuth('/checkout')) {
      navigate('/sign-in')
      return
    }
    navigate('/checkout')
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-page">
      <AppHeader
        search={query}
        onSearchChange={setQuery}
        cartOpen={cartOpen}
        onCartOpenChange={setCartOpen}
      />

      <div className="flex min-h-0 flex-1">
        {showSideNav ? (
          <nav className="flex w-[216px] shrink-0 flex-col gap-1 px-6 pt-[26px]">
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
        ) : null}

        <div
          className={[
            'relative flex min-w-0 flex-1 flex-col border-black/10 bg-card wide:border-e',
            showSideNav ? 'border-s' : '',
          ].join(' ')}
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5 overflow-x-hidden overflow-y-auto border-b border-black/10 px-6 pb-8 pt-5 sm:px-10 sm:pt-[26px] wide:border-b-0">
          <div className="relative flex min-w-0 shrink-0 flex-wrap items-center justify-between gap-3 overflow-hidden rounded-[14px] bg-hero px-5 py-8 text-on-hero sm:px-[30px] sm:py-8">
            <div className="pointer-events-none absolute -end-4 -top-6 select-none text-white/[0.07]">
              <DineOsMark size={140} color="currentColor" />
            </div>
            <div className="relative flex min-w-0 flex-1 flex-col gap-1">
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

          {!showSideNav ? (
            <label className="flex h-11 shrink-0 items-center gap-2.5 rounded-pill bg-surface px-[18px] text-muted">
              <span aria-hidden>⌕</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('menu.searchPlaceholder')}
                className="h-full w-full bg-transparent text-[13.5px] font-semibold text-ink outline-none placeholder:text-muted"
              />
            </label>
          ) : null}

          {!showSideNav ? (
            <CategoryChipScroller
              categories={chipCategories}
              activeId={category}
              onChange={setCategory}
            />
          ) : null}

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
              {showSideNav ? (
                <div className="flex shrink-0 items-baseline justify-between">
                  <h2 className="font-display text-[19px] font-bold tracking-tight">
                    {activeCategoryLabel}
                  </h2>
                  <span className="text-[12.5px] font-extrabold text-link">
                    {t('menu.itemCount', { count: items.length })}
                  </span>
                </div>
              ) : null}

              {items.length === 0 ? (
                <p className="text-[13.5px] font-semibold text-sub">
                  {t('menu.noResults')}
                </p>
              ) : (
                <div className="grid shrink-0 grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
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
          <CartMenuBar onCheckout={goCheckout} />
        </div>

        <CartRail onCheckout={goCheckout} />
      </div>

      <CartOverlay
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={goCheckout}
      />

      <ItemCustomizeModal itemId={itemId} onClose={closeItem} />
    </div>
  )
}
