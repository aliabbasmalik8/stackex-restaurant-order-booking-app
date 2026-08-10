import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { BrandMark, Button, Field, Text } from '@/components/ui'
import { useAuth, useLogin } from '@/modules/auth'
import { brand } from '@/theme'

export function LoginScreen() {
  const { t } = useTranslation()
  const { authReady, isAuthenticated, firebaseConfigured } = useAuth()
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
    <main className="flex min-h-screen items-center justify-center bg-page px-6">
      <section className="w-full max-w-md rounded-xl bg-card p-8 shadow-card">
        <div className="mb-8 flex items-center gap-4">
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

        <Text variant="display" className="mb-2">
          {t('auth.signInTitle')}
        </Text>
        <Text variant="subtitle" className="mb-8 text-sub">
          {t('auth.signInSubtitle')}
        </Text>

        {!firebaseConfigured ? (
          <Text variant="body" className="mb-4 text-error">
            {t('auth.errors.config_missing')}
          </Text>
        ) : null}

        <form className="flex flex-col gap-4" onSubmit={(e) => void onSubmit(e)}>
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
            disabled={loading || !firebaseConfigured}
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
            disabled={loading || !firebaseConfigured}
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
            disabled={!firebaseConfigured}
            className="mt-2 w-full"
          />
        </form>
      </section>
    </main>
  )
}
