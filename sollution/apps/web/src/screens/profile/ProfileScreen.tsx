import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '@/components/layout/AppHeader'
import { AddressDropdown } from '@/components/layout/AddressDropdown'
import { LanguageModal, PreviewThemeModal, Text } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { formatAddress, hasAddress, toCustomerAddress } from '@/core/profile'
import { useAddresses } from '@/api/OrderBooking/modules/addresses'
import { useLanguage } from '@/i18n/LanguageContext'
import { LOCALE_META } from '@/i18n'
import { isPreviewMode } from '@/lib/previewMode'
import { useTheme } from '@/theme'

export function ProfileScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { locale } = useLanguage()
  const { paletteId } = useTheme()
  const { profile, signOut } = useAuth()
  const { data: addresses = [] } = useAddresses(Boolean(profile))
  const [langOpen, setLangOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [addressOpen, setAddressOpen] = useState(false)
  const preview = isPreviewMode()

  const name = profile?.name ?? t('profile.fallbackName')
  const contact = profile?.contact
  const initial = profile?.initial ?? '?'
  const defaultAddress =
    addresses.find((row) => row.isDefault) ?? addresses[0] ?? null
  const addressLine = hasAddress(defaultAddress)
    ? formatAddress(toCustomerAddress(defaultAddress))
    : null

  return (
    <div className="flex h-full min-h-0 flex-col bg-page">
      <AppHeader />
      <div className="mx-auto flex min-h-0 w-full max-w-[1120px] flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-9 lg:py-[30px]">
        <Text as="h1" variant="display">
          {t('profile.title')}
        </Text>
        <p className="mt-1 text-[13.5px] font-semibold text-sub">
          {t('profile.subtitle')}
        </p>

        <div className="mt-7 flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-[26px]">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <button
              type="button"
              onClick={() => navigate('/profile/edit')}
              className="flex items-center gap-3.5 rounded-[22px] bg-hero p-5 text-start text-on-hero shadow-card"
            >
              <span className="grid size-[52px] shrink-0 place-items-center rounded-full bg-white/16 font-display text-[19px] font-bold">
                {initial}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[16px] font-extrabold">
                  {name}
                </span>
                {contact ? (
                  <span className="mt-0.5 block truncate text-[12.5px] font-semibold text-white/70">
                    {contact}
                  </span>
                ) : null}
                {addressLine ? (
                  <span className="mt-1 block text-[11.5px] font-semibold leading-snug text-white/65">
                    {addressLine}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 text-[12.5px] font-extrabold text-white/90">
                {t('common.edit')}
              </span>
            </button>

            <div className="overflow-hidden rounded-[20px] bg-card shadow-card">
              <Row
                icon="📍"
                label={t('checkout.address')}
                hint={
                  addressLine ?? t('checkout.addressMissing')
                }
                onClick={() => setAddressOpen(true)}
                trailing={
                  <span className="text-[12.5px] font-extrabold text-link">
                    {addressLine ? t('common.edit') : t('checkout.addressAdd')}
                  </span>
                }
              />
              <Row
                icon="🌐"
                label={t('profile.language')}
                onClick={() => setLangOpen(true)}
                trailing={
                  <span className="text-[12.5px] font-extrabold text-link">
                    {t(LOCALE_META[locale].nativeKey)}
                  </span>
                }
              />
              <Row
                icon="🔑"
                label={t('profile.signInMethods')}
                onClick={() => navigate('/profile/sign-in')}
              />
              <Row
                icon="🧾"
                label={t('nav.orders')}
                onClick={() => navigate('/orders')}
                last={!preview}
              />
              {preview ? (
                <Row
                  icon="🎨"
                  label={t('preview.themeChip')}
                  onClick={() => setThemeOpen(true)}
                  last
                  trailing={
                    <span className="text-[12.5px] font-extrabold text-link">
                      {t(`preview.palettes.${paletteId}`)}
                    </span>
                  }
                />
              ) : null}
            </div>

            <div className="overflow-hidden rounded-[20px] bg-card shadow-card">
              <button
                type="button"
                onClick={() => {
                  void (async () => {
                    await signOut()
                    navigate('/sign-in', { replace: true })
                  })()
                }}
                className="flex w-full px-[17px] py-[15px] text-start text-[14px] font-bold text-error hover:bg-surface"
              >
                {t('profile.signOut')}
              </button>
            </div>
          </div>

          <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-[340px]">
            <div className="rounded-[22px] bg-card p-6 shadow-card">
              <p className="text-[11px] font-extrabold tracking-[0.08em] text-muted uppercase">
                {t('profile.emailReadOnly')}
              </p>
              <p className="mt-1.5 break-all text-[15px] font-bold">
                {profile?.email ?? t('profile.emailMissing')}
              </p>
              <p className="mt-2 text-[12.5px] font-semibold leading-snug text-sub">
                {t('profile.emailFromAuth')}
              </p>
            </div>
          </aside>
        </div>
      </div>

      <LanguageModal open={langOpen} onClose={() => setLangOpen(false)} />
      <PreviewThemeModal open={themeOpen} onClose={() => setThemeOpen(false)} />
      <AddressDropdown
        hideTrigger
        open={addressOpen}
        onOpenChange={setAddressOpen}
      />
    </div>
  )
}

function Row({
  icon,
  label,
  hint,
  trailing,
  last,
  onClick,
}: {
  icon: string
  label: string
  hint?: string
  trailing?: ReactNode
  last?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex w-full items-center gap-3 px-[17px] py-[15px] text-start hover:bg-surface',
        last ? '' : 'border-b border-divider',
      ].join(' ')}
    >
      <span className="grid size-[34px] shrink-0 place-items-center rounded-[11px] bg-surface text-[14px]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-bold">{label}</span>
        {hint ? (
          <span className="mt-0.5 block truncate text-[12px] font-semibold text-muted">
            {hint}
          </span>
        ) : null}
      </span>
      {trailing ?? <span className="text-[18px] text-muted">›</span>}
    </button>
  )
}
