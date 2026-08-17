import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { BrandMark, LanguageModal, Text } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { useBrand } from '@/core/settings'
import { useCatalog } from '@/core/catalog'
import { localized } from '@/utils/localized'
import { useLanguage } from '@/i18n/LanguageContext'
import { LOCALE_META } from '@/i18n'
import { useState } from 'react'

export function AppHeader({ search, onSearchChange }: {
  search: string
  onSearchChange: (value: string) => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const brand = useBrand()
  const { profile, isAuthenticated, requireAuth } = useAuth()
  const { primaryBranch } = useCatalog()
  const { locale } = useLanguage()
  const [langOpen, setLangOpen] = useState(false)

  const branchLabel = primaryBranch
    ? localized(locale, primaryBranch.name, primaryBranch.name_arabic)
    : ''

  const goOrders = () => {
    if (!requireAuth('/menu')) {
      navigate('/sign-in')
    }
  }

  return (
    <header className="flex shrink-0 items-center gap-7 bg-card px-9 py-4 shadow-[0_1px_0_var(--divider)]">
      <Link to="/menu" className="flex items-center gap-3 no-underline">
        <BrandMark size={40} tone="solid" />
        <div className="flex flex-col">
          <span className="font-display text-base font-bold tracking-tight text-ink">
            {brand.name}
          </span>
          <span className="text-[11px] font-bold text-sub">
            {t('menu.pickup')}
            {branchLabel ? ` · ${branchLabel}` : ''}
          </span>
        </div>
      </Link>

      <label className="flex h-11 max-w-[460px] flex-1 items-center gap-2.5 rounded-pill bg-surface px-[18px] text-muted">
        <span aria-hidden>⌕</span>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('menu.searchPlaceholder')}
          className="h-full w-full bg-transparent text-[13.5px] font-semibold text-ink outline-none placeholder:text-muted"
        />
      </label>

      <div className="ms-auto flex items-center gap-4">
        <button
          type="button"
          onClick={() => setLangOpen(true)}
          className="text-[12.5px] font-extrabold text-sub"
        >
          {t(LOCALE_META[locale].nativeKey)}
        </button>
        <button
          type="button"
          onClick={goOrders}
          className="text-[13px] font-extrabold text-sub"
        >
          {t('nav.orders')}
        </button>
        {isAuthenticated && profile ? (
          <div className="flex items-center gap-2.5 rounded-pill bg-surface py-1.5 pe-3.5 ps-1.5">
            <span className="grid size-[30px] place-items-center rounded-full bg-hero font-display text-xs font-bold text-on-hero">
              {profile.initial}
            </span>
            <Text as="span" variant="caption">
              {profile.shortName}
            </Text>
          </div>
        ) : (
          <Link
            to="/sign-in"
            className="rounded-pill bg-surface px-4 py-2 text-[13px] font-extrabold text-ink no-underline"
          >
            {t('nav.signIn')}
          </Link>
        )}
      </div>

      <LanguageModal open={langOpen} onClose={() => setLangOpen(false)} />
    </header>
  )
}
