import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
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

function navLinkClass(isActive: boolean, collapsed: boolean) {
  return [
    'flex items-center gap-3 rounded-lg text-sm font-bold transition-colors',
    collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
    isActive
      ? 'bg-sel text-sel-text'
      : 'text-sub hover:bg-surface hover:text-ink',
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
        'flex h-full flex-col border-e border-divider bg-card transition-[width] duration-200',
        collapsed ? 'w-[72px]' : 'w-60',
      ].join(' ')}
    >
      <div
        className={[
          'flex h-16 items-center border-b border-divider',
          collapsed ? 'justify-center px-2' : 'gap-3 px-4',
        ].join(' ')}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-hero">
          <BrandMark size={28} />
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <Text variant="label" className="m-0 truncate">
              {brand.product}
            </Text>
            <Text as="p" variant="bodyStrong" className="m-0 truncate">
              {brand.name}
            </Text>
          </div>
        ) : null}
      </div>

      <nav
        className="flex flex-1 flex-col gap-1 overflow-y-auto p-2"
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
            <span className="shrink-0">{item.icon as ReactNode}</span>
            {!collapsed ? (
              <span className="truncate">{t(item.labelKey)}</span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-divider p-2">
        {!collapsed && user?.email ? (
          <Text
            variant="caption"
            className="mb-2 truncate px-2 text-muted"
            title={user.email}
          >
            {user.email}
          </Text>
        ) : null}

        <Button
          variant="secondary"
          className={[
            'w-full text-sm',
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
              'mt-2 flex w-full items-center gap-2 rounded-lg py-2 text-sm font-bold text-sub',
              'hover:bg-surface hover:text-ink',
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
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)

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
    <div className="flex min-h-screen bg-page">
      <div className="sticky top-0 hidden h-screen shrink-0 md:block">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label={t('common.close')}
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 start-0 z-50 h-full shadow-card">
            <Sidebar
              collapsed={false}
              showCollapseControl={false}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-divider bg-card px-4 md:px-6">
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg text-ink hover:bg-surface md:hidden"
            aria-label={t('nav.menu')}
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon />
          </button>
          <button
            type="button"
            className="hidden size-10 items-center justify-center rounded-lg text-sub hover:bg-surface hover:text-ink md:inline-flex"
            aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
            onClick={toggleCollapsed}
          >
            <ChevronIcon collapsed={collapsed} />
          </button>
          <Text variant="label" className="m-0 truncate md:hidden">
            {brand.name}
          </Text>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
