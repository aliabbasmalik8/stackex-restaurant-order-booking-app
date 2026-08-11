import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BrandMark, Button, Text } from '@/components/ui'
import { useAuth } from '@/modules/auth'
import { brand } from '@/theme'
import { NAV_ITEMS } from './navItems'

const SIDEBAR_STORAGE_KEY = '@order-booking/admin-sidebar-collapsed'

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function ChevronIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={[
        'size-4 transition-transform duration-200',
        collapsed ? 'rotate-180' : '',
      ].join(' ')}
    >
      <path
        d="M14.5 6.5 9 12l5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-5">
      <path
        d="M5 7h14M5 12h14M5 17h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-5">
      <path
        d="M10 7V5.8A1.8 1.8 0 0 1 11.8 4h6.4A1.8 1.8 0 0 1 20 5.8v12.4a1.8 1.8 0 0 1-1.8 1.8h-6.4A1.8 1.8 0 0 1 10 18.2V17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M13 12H4m0 0 2.5-2.5M4 12l2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function pageTitleFromPath(pathname: string, t: (k: string) => string) {
  if (pathname.startsWith('/categories')) return t('nav.categories')
  if (pathname.startsWith('/products')) return t('nav.products')
  if (pathname.startsWith('/orders')) return t('nav.orders')
  return brand.product
}

function navLinkClass(isActive: boolean, collapsed: boolean) {
  return [
    'relative flex items-center gap-3 rounded-xl text-sm font-bold transition-all duration-150',
    collapsed ? 'justify-center px-2 py-3' : 'px-3.5 py-3',
    isActive ? 'dash-sidebar-nav-active' : 'dash-sidebar-nav-idle',
  ].join(' ')
}

type SidebarProps = {
  collapsed: boolean
  onNavigate?: () => void
  onToggleCollapse?: () => void
  showCollapseControl?: boolean
}

function Sidebar({
  collapsed,
  onNavigate,
  onToggleCollapse,
  showCollapseControl = true,
}: SidebarProps) {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()

  return (
    <aside
      className={[
        'dash-sidebar flex h-full flex-col transition-[width] duration-200',
        collapsed ? 'w-[76px]' : 'w-[260px]',
      ].join(' ')}
    >
      <div
        className={[
          'flex h-[4.25rem] items-center',
          collapsed ? 'justify-center px-2' : 'gap-3 px-4',
        ].join(' ')}
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-hero-glass ring-1 ring-hero-glass-border">
          <BrandMark size={30} />
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="m-0 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/55">
              {brand.product}
            </p>
            <p className="m-0 truncate font-display text-[15px] font-bold tracking-tight text-on-hero">
              {brand.name}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mx-3 mb-2 h-px bg-white/10" />

      {!collapsed ? (
        <p className="mb-2 px-5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/40">
          {t('nav.main')}
        </p>
      ) : null}

      <nav
        className="flex flex-1 flex-col gap-1 overflow-y-auto px-2.5 pb-3"
        aria-label={t('nav.main')}
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            title={collapsed ? t(item.labelKey) : undefined}
            onClick={onNavigate}
            className={({ isActive }) => navLinkClass(isActive, collapsed)}
          >
            <span className="shrink-0 opacity-95">{item.icon as ReactNode}</span>
            {!collapsed ? (
              <span className="truncate tracking-tight">{t(item.labelKey)}</span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/10 p-2.5">
        {!collapsed && user?.email ? (
          <div className="mb-2 rounded-xl bg-white/6 px-3 py-2.5 ring-1 ring-white/10">
            <p className="m-0 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/45">
              {t('nav.signedIn')}
            </p>
            <p className="m-0 truncate text-xs font-semibold text-white/85" title={user.email}>
              {user.email}
            </p>
          </div>
        ) : null}

        <Button
          variant="ghost"
          className={[
            'w-full border border-white/15 bg-white/5 text-sm text-on-hero hover:bg-white/10',
            collapsed ? 'h-10 justify-center px-0' : 'h-10',
          ].join(' ')}
          title={t('auth.signOut')}
          aria-label={t('auth.signOut')}
          leftSlot={<SignOutIcon />}
          label={collapsed ? undefined : t('auth.signOut')}
          onClick={() => void signOut()}
        />

        {showCollapseControl && onToggleCollapse ? (
          <button
            type="button"
            className={[
              'mt-2 flex w-full items-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white/55',
              'hover:bg-white/8 hover:text-on-hero',
              collapsed ? 'justify-center px-2' : 'px-3',
            ].join(' ')}
            onClick={onToggleCollapse}
            aria-pressed={collapsed}
            aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
          >
            <ChevronIcon collapsed={collapsed} />
            {!collapsed ? <span>{t('nav.collapse')}</span> : null}
          </button>
        ) : null}
      </div>
    </aside>
  )
}

export function DashboardLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pageTitle = pageTitleFromPath(location.pathname, t)

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? '1' : '0')
    } catch {
      // ignore
    }
  }, [collapsed])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  const toggleCollapsed = () => setCollapsed((v) => !v)

  return (
    <div className="dash-canvas relative flex min-h-screen">
      <div className="sticky top-0 z-20 hidden h-screen shrink-0 md:block">
        <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
            aria-label={t('common.close')}
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 start-0 z-50 h-full shadow-sidebar">
            <Sidebar
              collapsed={false}
              showCollapseControl={false}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="relative z-[1] flex min-w-0 flex-1 flex-col">
        <header className="dash-topbar sticky top-0 z-30 flex h-[4.25rem] items-center gap-3 px-4 md:px-7">
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-xl text-ink hover:bg-surface md:hidden"
            aria-label={t('nav.menu')}
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon />
          </button>
          <button
            type="button"
            className="hidden size-10 items-center justify-center rounded-xl text-sub hover:bg-surface hover:text-ink md:inline-flex"
            aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
            onClick={toggleCollapsed}
          >
            <ChevronIcon collapsed={collapsed} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="m-0 text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted">
              {brand.name}
            </p>
            <Text as="p" variant="bodyStrong" className="m-0 truncate tracking-tight">
              {pageTitle}
            </Text>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8 md:py-8">
          <div key={location.pathname} className="dash-fade-in w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
