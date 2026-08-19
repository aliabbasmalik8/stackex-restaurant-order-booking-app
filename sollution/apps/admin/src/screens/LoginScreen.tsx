import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { BrandMark, DineOsMark, DineOsWordmark, Button, Field, Text } from '@/components/ui'
import { useAuth, useLogin } from '@/modules/auth'
import { brand } from '@/theme'

export function LoginScreen() {
  const { t } = useTranslation()
  const { authReady, isAuthenticated, apiConfigured } = useAuth()
  const {
    email,
    password,
    setEmail,
    setPassword,
    loading,
    error,
    clearError,
    submit,
  } = useLogin()

  if (authReady && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    await submit()
  }

  return (
    <main className="dash-canvas relative flex min-h-screen">
      <section className="relative z-[1] hidden w-[42%] flex-col justify-between overflow-hidden bg-hero px-10 py-12 text-on-hero lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.18), transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(200,145,46,0.35), transparent 45%)',
          }}
        />
        <div
          className="pointer-events-none absolute -end-8 bottom-8 text-white/[0.06]"
          aria-hidden
        >
          <DineOsMark size={260} color="currentColor" />
        </div>
        <div className="relative">
          <div className="mb-8 flex items-center gap-3">
            <BrandMark size={56} />
            <DineOsWordmark fontSize={28} color="currentColor" />
          </div>
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/55">
            {brand.product}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            {t('auth.signInSubtitle')}
          </p>
        </div>
        <p className="relative text-xs font-semibold text-white/40">
          {t('auth.opsHint')}
        </p>
      </section>

      <section className="relative z-[1] flex flex-1 items-center justify-center px-6 py-12">
        <div className="dash-fade-in w-full max-w-[420px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandMark size={44} className="bg-hero ring-0" />
            <div>
              <Text variant="label" className="mb-0.5">
                {brand.product}
              </Text>
              <DineOsWordmark fontSize={22} className="text-ink" />
            </div>
          </div>

          <div className="dash-panel p-7 md:p-8">
            <Text variant="display" className="mb-2 tracking-tight">
              {t('auth.signInTitle')}
            </Text>
            <Text variant="subtitle" className="mb-7 text-sub">
              {t('auth.signInSubtitle')}
            </Text>

            {!apiConfigured ? (
              <Text variant="body" className="mb-4 text-error">
                {t('auth.errors.config_missing')}
              </Text>
            ) : null}

            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => void onSubmit(e)}
            >
              <Field
                label={t('auth.email')}
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  clearError()
                  setEmail(e.target.value)
                }}
                disabled={loading || !apiConfigured}
                placeholder="admin@example.com"
              />
              <Field
                label={t('auth.password')}
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  clearError()
                  setPassword(e.target.value)
                }}
                disabled={loading || !apiConfigured}
              />

              {error ? (
                <Text variant="caption" className="text-error">
                  {error}
                </Text>
              ) : null}

              <Button
                type="submit"
                label={t('auth.signIn')}
                loading={loading}
                disabled={!apiConfigured}
                className="mt-2 w-full"
              />
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
