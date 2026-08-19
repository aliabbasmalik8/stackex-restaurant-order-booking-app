import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { LanguageModal, Text } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'

export function ProfileMenu() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!profile) return null

  const go = (path: string) => {
    setOpen(false)
    navigate(path)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid size-[38px] place-items-center rounded-full bg-surface p-0 wide:flex wide:h-auto wide:w-auto wide:gap-2.5 wide:rounded-pill wide:py-1.5 wide:pe-3.5 wide:ps-1.5"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={profile.name || t('nav.profile')}
      >
        <span className="grid size-[30px] place-items-center rounded-full bg-hero font-display text-xs font-bold text-on-hero">
          {profile.initial}
        </span>
        <Text as="span" variant="caption" className="hidden wide:inline">
          {profile.shortName}
        </Text>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute end-0 top-[calc(100%+8px)] z-30 w-[240px] overflow-hidden rounded-[18px] bg-card py-1.5 shadow-card-hover"
        >
          <div className="border-b border-divider px-4 py-3">
            <p className="text-[13.5px] font-extrabold">{profile.name}</p>
            {profile.contact ? (
              <p className="mt-0.5 truncate text-[12px] font-semibold text-sub">
                {profile.contact}
              </p>
            ) : null}
          </div>
          <MenuRow label={t('profile.title')} onClick={() => go('/profile')} />
          <MenuRow label={t('nav.orders')} onClick={() => go('/orders')} />
          <MenuRow
            label={t('profile.language')}
            onClick={() => {
              setOpen(false)
              setLangOpen(true)
            }}
          />
          <button
            type="button"
            role="menuitem"
            className="flex w-full px-4 py-2.5 text-start text-[13.5px] font-extrabold text-error hover:bg-surface"
            onClick={async () => {
              setOpen(false)
              await signOut()
              navigate('/sign-in', { replace: true })
            }}
          >
            {t('profile.signOut')}
          </button>
        </div>
      ) : null}

      <LanguageModal open={langOpen} onClose={() => setLangOpen(false)} />
    </div>
  )
}

function MenuRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="menuitem"
      className="flex w-full px-4 py-2.5 text-start text-[13.5px] font-bold text-ink hover:bg-surface"
      onClick={onClick}
    >
      {label}
    </button>
  )
}
