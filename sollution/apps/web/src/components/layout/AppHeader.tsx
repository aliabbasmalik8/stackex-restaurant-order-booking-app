import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { BrandMark, LanguageModal } from '@/components/ui'
import { AddressDropdown } from '@/components/layout/AddressDropdown'
import { MobileNavDrawer } from '@/components/layout/MobileNavDrawer'
import { ProfileMenu } from '@/components/layout/ProfileMenu'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useBrand } from '@/core/settings'
import { useLanguage } from '@/i18n/LanguageContext'
import { LOCALE_META } from '@/i18n'

function navClass(active: boolean) {
  return [
    'text-[13px] font-extrabold no-underline',
    active ? 'text-ink' : 'text-sub',
  ].join(' ')
}

export function AppHeader({
  search,
  onSearchChange,
  cartOpen = false,
  onCartOpenChange,
}: {
  search?: string
  onSearchChange?: (value: string) => void
  cartOpen?: boolean
  onCartOpenChange?: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const brand = useBrand()
  const { isAuthenticated, requireAuth } = useAuth()
  const { itemCount } = useCart()
  const { locale } = useLanguage()
  const [langOpen, setLangOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(min-width: 500px)')
    const closeIfWide = () => {
      if (media.matches) setNavOpen(false)
    }
    media.addEventListener('change', closeIfWide)
    return () => media.removeEventListener('change', closeIfWide)
  }, [])

  const goOrders = () => {
    if (!requireAuth('/orders')) {
      navigate('/sign-in')
      return
    }
    navigate('/orders')
  }

  const goCart = () => {
    if (onCartOpenChange) {
      onCartOpenChange(!cartOpen)
      return
    }
    if (itemCount === 0) {
      navigate('/menu')
      return
    }
    if (!requireAuth('/checkout')) {
      navigate('/sign-in')
      return
    }
    navigate('/checkout')
  }

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-black/10 bg-card px-6 py-4 sm:gap-5 sm:px-9">
      <Link
        to="/menu"
        aria-label={brand.name}
        className="flex shrink-0 items-center gap-3 no-underline"
      >
        <BrandMark size={40} tone="solid" />
        <div className="hidden flex-col wide:flex">
          <span className="font-display text-base font-bold tracking-tight text-ink">
            {brand.name}
          </span>
          <span className="text-[11px] font-bold text-sub">
            {t('menu.pickup')}
          </span>
        </div>
      </Link>

      <div className="min-w-0 flex-1 compact:flex-none">
        <AddressDropdown />
      </div>

      {onSearchChange ? (
        <label className="hidden h-11 min-w-0 max-w-[460px] flex-1 items-center gap-2.5 rounded-pill bg-surface px-[18px] text-muted side:flex">
          <span aria-hidden>⌕</span>
          <input
            value={search ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('menu.searchPlaceholder')}
            className="h-full w-full bg-transparent text-[13.5px] font-semibold text-ink outline-none placeholder:text-muted"
          />
        </label>
      ) : (
        <div className="hidden flex-1 side:block" />
      )}

      <div className="ms-auto flex items-center gap-3 sm:gap-4">
        {!isAuthenticated ? (
          <button
            type="button"
            onClick={() => setLangOpen(true)}
            className="hidden text-[12.5px] font-extrabold text-sub compact:inline"
          >
            {t(LOCALE_META[locale].nativeKey)}
          </button>
        ) : null}
        <NavLink
          to="/menu"
          className={({ isActive }) =>
            ['hidden compact:inline', navClass(isActive)].join(' ')
          }
        >
          {t('nav.menu')}
        </NavLink>
        <button
          type="button"
          onClick={goOrders}
          className={[
            'hidden compact:inline',
            navClass(location.pathname.startsWith('/orders')),
          ].join(' ')}
        >
          {t('nav.orders')}
        </button>
        <button
          type="button"
          onClick={goCart}
          className="relative grid size-[38px] place-items-center rounded-full bg-surface text-ink wide:hidden"
          aria-expanded={cartOpen}
          aria-controls="cart-sidebar"
          aria-label={t('cart.openAria')}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 7h15l-1.4 8.4a2 2 0 0 1-2 1.6H9.4a2 2 0 0 1-2-1.6L6 7Z" />
            <path d="M6 7 5 4H2" />
            <circle cx="9" cy="20" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="18" cy="20" r="1.2" fill="currentColor" stroke="none" />
          </svg>
          {itemCount > 0 ? (
            <span className="absolute -end-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-cta px-1 text-[10px] font-extrabold leading-[18px] text-on-primary">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          className="grid size-[38px] shrink-0 place-items-center rounded-full bg-surface text-ink compact:hidden"
          aria-expanded={navOpen}
          aria-controls="mobile-nav"
          aria-label={t('nav.openMenu')}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </svg>
        </button>
        {isAuthenticated ? (
          <div className="hidden compact:block">
            <ProfileMenu />
          </div>
        ) : (
          <Link
            to="/sign-in"
            className="hidden rounded-pill bg-surface px-4 py-2 text-[13px] font-extrabold text-ink no-underline compact:inline"
          >
            {t('nav.signIn')}
          </Link>
        )}
      </div>

      <LanguageModal open={langOpen} onClose={() => setLangOpen(false)} />
      <MobileNavDrawer open={navOpen} onClose={() => setNavOpen(false)} />
    </header>
  )
}
