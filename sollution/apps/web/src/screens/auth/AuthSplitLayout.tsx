import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { BrandMark, LanguageModal } from '@/components/ui'
import { useBrand } from '@/core/settings'
import { useCatalog } from '@/core/catalog'
import { LOCALE_META } from '@/i18n'
import { useLanguage } from '@/i18n/LanguageContext'
import { localized } from '@/utils/localized'

export function AuthSplitLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const brand = useBrand()
  const { locale } = useLanguage()
  const { primaryBranch } = useCatalog()
  const [langOpen, setLangOpen] = useState(false)

  const etaMinutes = primaryBranch?.etaMinutes ?? 15
  const branchLine = primaryBranch
    ? [
        localized(locale, primaryBranch.name, primaryBranch.name_arabic),
        localized(locale, primaryBranch.address, primaryBranch.address_arabic),
      ]
        .filter(Boolean)
        .join(' · ')
    : brand.name

  return (
    <main className="flex min-h-full bg-card">
      <section className="relative hidden w-1/2 flex-col overflow-hidden bg-hero px-12 py-10 text-on-hero lg:flex">
        <div
          className="pointer-events-none absolute -end-10 bottom-10 select-none font-display text-[320px] font-bold leading-none text-white/[0.06]"
          aria-hidden
        >
          {brand.monogram}
        </div>

        <div className="relative z-[1] flex items-center gap-3">
          <BrandMark size={40} />
          <span className="font-display text-[17px] font-bold tracking-tight">
            {brand.name}
          </span>
        </div>

        <div className="relative z-[1] my-auto max-w-[420px]">
          <h1 className="font-display text-[42px] font-bold leading-[1.12] tracking-tight">
            {t('auth.heroTitle')}
          </h1>
          <p className="mt-4 max-w-[380px] text-[15px] font-semibold leading-relaxed text-white/72">
            {t('auth.heroBody')}
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <span className="rounded-pill border-[1.5px] border-white/25 bg-white/10 px-4 py-2 text-[12.5px] font-extrabold">
              ⚡ {t('auth.heroEta', { minutes: etaMinutes })}
            </span>
            <span className="rounded-pill border-[1.5px] border-white/25 bg-white/10 px-4 py-2 text-[12.5px] font-extrabold">
              {t('auth.heroPickup')}
            </span>
          </div>
        </div>

        <p className="relative z-[1] text-[13px] font-semibold text-white/45">
          {branchLine}
        </p>
      </section>

      <section className="relative flex flex-1 flex-col px-6 py-8 sm:px-12 lg:w-1/2 lg:px-16 lg:py-10">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 lg:hidden">
            <BrandMark size={40} tone="solid" />
            <span className="font-display text-[16px] font-bold text-ink">
              {brand.name}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setLangOpen(true)}
            className="ms-auto rounded-pill border border-border bg-surface px-3 py-1.5 text-[12.5px] font-bold text-ink"
          >
            {t(LOCALE_META[locale].nativeKey)}
          </button>
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center">
          {children}
        </div>
      </section>

      <LanguageModal open={langOpen} onClose={() => setLangOpen(false)} />
    </main>
  )
}
