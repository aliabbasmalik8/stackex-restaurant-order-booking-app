import { useTranslation } from 'react-i18next'
import { BrandMark, Button, Text } from '@/components/ui'
import { useAuth } from '@/modules/auth'
import { useLanguage } from '@/i18n/LanguageContext'
import { LOCALE_META, SUPPORTED_LOCALES, type AppLocale } from '@/i18n'
import { brand } from '@/theme'

export function WelcomeScreen() {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()
  const { locale, setLocale } = useLanguage()

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-6">
      <section className="w-full max-w-md rounded-xl bg-card p-8 shadow-card">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-lg bg-hero">
              <BrandMark size={40} />
            </div>
            <div>
              <Text variant="label" className="mb-1">
                {brand.product}
              </Text>
              <Text as="h1" variant="title" className="m-0">
                {brand.name}
              </Text>
            </div>
          </div>

          <div
            className="flex rounded-pill border border-border bg-surface p-1"
            role="group"
            aria-label={t('languages.title')}
          >
            {SUPPORTED_LOCALES.map((code: AppLocale) => {
              const active = code === locale
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => void setLocale(code)}
                  className={[
                    'rounded-pill px-3 py-1.5 text-xs font-bold transition-colors',
                    active
                      ? 'bg-sel text-sel-text'
                      : 'text-sub hover:text-ink',
                  ].join(' ')}
                >
                  {t(LOCALE_META[code].nativeKey)}
                </button>
              )
            })}
          </div>
        </div>

        <Text variant="display" className="mb-3">
          {t('welcome.title')}
        </Text>
        <Text variant="subtitle" className="mb-2 text-sub">
          {t('welcome.body')}
        </Text>
        {user?.email ? (
          <Text variant="caption" className="mb-8 text-muted">
            {user.email}
          </Text>
        ) : (
          <div className="mb-8" />
        )}

        <Button
          label={t('auth.signOut')}
          variant="secondary"
          className="w-full"
          onClick={() => void signOut()}
        />
      </section>
    </main>
  )
}
