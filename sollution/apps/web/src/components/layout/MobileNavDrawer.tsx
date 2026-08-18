import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { LanguageModal } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'

export function MobileNavDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, profile, requireAuth, signOut } = useAuth()
  const [langOpen, setLangOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  const go = (path: string, authed = false) => {
    if (authed && !requireAuth(path)) {
      onClose()
      navigate('/sign-in')
      return
    }
    onClose()
    navigate(path)
  }

  const menuActive = location.pathname.startsWith('/menu')
  const ordersActive = location.pathname.startsWith('/orders')
  const profileActive = location.pathname.startsWith('/profile')

  return (
    <div className="fixed inset-0 z-40 compact:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        aria-label={t('common.close')}
        onClick={onClose}
      />
      <div
        id="mobile-nav"
        role="dialog"
        aria-label={t('nav.openMenu')}
        className="absolute inset-y-0 right-0 z-10 flex w-[min(320px,86vw)] flex-col bg-card shadow-card-hover"
      >
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          {isAuthenticated && profile ? (
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-[38px] shrink-0 place-items-center rounded-full bg-hero font-display text-sm font-bold text-on-hero">
                {profile.initial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[14.5px] font-extrabold">{profile.name}</p>
                {profile.contact ? (
                  <p className="truncate text-[12px] font-semibold text-sub">
                    {profile.contact}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="min-w-0">
              <p className="text-[14.5px] font-extrabold">
                {t('profile.fallbackName')}
              </p>
              <p className="text-[12px] font-semibold text-sub">
                {t('nav.signIn')}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="grid size-[38px] shrink-0 place-items-center rounded-full bg-surface text-sub"
            aria-label={t('common.close')}
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-3">
          <DrawerRow
            label={t('nav.menu')}
            active={menuActive}
            onClick={() => go('/menu')}
          />
          <DrawerRow
            label={t('nav.orders')}
            active={ordersActive}
            onClick={() => go('/orders', true)}
          />
          {isAuthenticated ? (
            <DrawerRow
              label={t('nav.profile')}
              active={profileActive}
              onClick={() => go('/profile')}
            />
          ) : (
            <DrawerRow
              label={t('nav.signIn')}
              active={location.pathname.startsWith('/sign-in')}
              onClick={() => go('/sign-in')}
            />
          )}
          <DrawerRow
            label={t('profile.language')}
            onClick={() => setLangOpen(true)}
          />
        </nav>

        {isAuthenticated ? (
          <div className="border-t border-black/10 px-3 py-3">
            <button
              type="button"
              className="flex w-full rounded-[13px] px-3.5 py-[11px] text-start text-[13.5px] font-extrabold text-error"
              onClick={async () => {
                onClose()
                await signOut()
                navigate('/sign-in', { replace: true })
              }}
            >
              {t('profile.signOut')}
            </button>
          </div>
        ) : null}
      </div>

      <LanguageModal open={langOpen} onClose={() => setLangOpen(false)} />
    </div>
  )
}

function DrawerRow({
  label,
  active = false,
  onClick,
}: {
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-[13px] px-3.5 py-[11px] text-start text-[13.5px]',
        active
          ? 'bg-sel font-extrabold text-sel-text'
          : 'font-bold text-ink hover:bg-surface',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
