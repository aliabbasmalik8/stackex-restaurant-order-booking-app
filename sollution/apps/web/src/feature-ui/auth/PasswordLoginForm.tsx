import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, FormError, Text } from '@/components/ui'
import {
  AuthError,
  authErrorMessageKey,
  lookupEmailAuthStatus,
  sendPasswordReset,
  toAuthError,
} from '@/core/auth'
import {
  getPasswordAuthStatus,
  isPasswordAuthInteractive,
} from '@/features/auth'

export type PasswordLoginValues = {
  email: string
  password: string
}

type PasswordLoginFormProps = {
  onSubmit?: (values: PasswordLoginValues) => void | Promise<void>
  tone?: 'hero' | 'light'
}

export function PasswordLoginForm({
  onSubmit,
  tone = 'light',
}: PasswordLoginFormProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const status = getPasswordAuthStatus()
  const interactive = isPasswordAuthInteractive()
  const emailValid = email.trim().includes('@')

  const canContinue = interactive && !loading && emailValid && !showPasswordField
  const canSignIn =
    interactive &&
    !loading &&
    showPasswordField &&
    emailValid &&
    password.trim().length >= 6

  const resetLookup = () => {
    setShowPasswordField(false)
    setResetSent(false)
    setPassword('')
    setErrorKey(null)
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (showPasswordField || resetSent || errorKey) {
      resetLookup()
    }
  }

  const handleContinue = async () => {
    if (!canContinue) return
    setLoading(true)
    setErrorKey(null)
    try {
      const emailStatus = await lookupEmailAuthStatus(email)
      if (emailStatus === 'ok') {
        setResetSent(false)
        setShowPasswordField(true)
        return
      }
      if (emailStatus === 'account-not-exist') {
        setResetSent(false)
        setErrorKey('auth.errors.account_not_exist')
        return
      }
      await sendPasswordReset(email)
      setResetSent(true)
    } catch (error) {
      const authErr = error instanceof AuthError ? error : toAuthError(error)
      setErrorKey(authErrorMessageKey(authErr.code))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault()
    if (!showPasswordField) {
      await handleContinue()
      return
    }
    if (!canSignIn) return
    setLoading(true)
    setErrorKey(null)
    try {
      await onSubmit?.({ email: email.trim(), password })
    } catch (error) {
      const authErr = error instanceof AuthError ? error : toAuthError(error)
      setErrorKey(authErrorMessageKey(authErr.code))
    } finally {
      setLoading(false)
    }
  }

  const bannerMessage = errorKey ? t(errorKey) : t('auth.passwordResetSent')
  const isLight = tone === 'light'

  return (
    <form className="mt-7 flex flex-col gap-3" onSubmit={(e) => void handleSubmit(e)}>
      {errorKey || resetSent ? (
        <div
          className={[
            'flex items-center overflow-hidden rounded-md',
            errorKey
              ? isLight
                ? 'bg-red-50'
                : 'bg-red-500/25'
              : isLight
                ? 'bg-emerald-50'
                : 'bg-emerald-400/25',
          ].join(' ')}
        >
          <span
            className={[
              'w-[3px] self-stretch',
              errorKey ? 'bg-error' : 'bg-emerald-500',
            ].join(' ')}
          />
          <p
            className={[
              'flex-1 px-2.5 py-2 text-[12px] font-semibold leading-tight',
              isLight ? 'text-ink' : 'text-on-hero',
            ].join(' ')}
          >
            {bannerMessage}
          </p>
          <button
            type="button"
            className={[
              'grid size-7 place-items-center',
              isLight ? 'text-sub' : 'text-on-hero',
            ].join(' ')}
            aria-label={t('common.close')}
            onClick={() => {
              setErrorKey(null)
              setResetSent(false)
            }}
          >
            ×
          </button>
        </div>
      ) : null}

      <label className="flex flex-col gap-1.5">
        <Text as="span" variant="label" className="ps-1">
          {t('auth.email')}
        </Text>
        <div className="flex h-[58px] items-center rounded-[16px] border-[1.5px] border-border bg-card px-[18px] focus-within:border-cta focus-within:ring-2 focus-within:ring-cta/15">
          <input
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder={t('auth.emailPlaceholder')}
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            disabled={!interactive || loading}
            className="h-full flex-1 bg-transparent text-[15px] font-bold text-ink outline-none placeholder:text-muted"
          />
        </div>
      </label>

      {showPasswordField ? (
        <label className="flex flex-col gap-1.5">
          <Text as="span" variant="label" className="ps-1">
            {t('auth.password')}
          </Text>
          <div className="flex h-[58px] items-center rounded-[16px] border-[1.5px] border-border bg-card px-[18px] focus-within:border-cta focus-within:ring-2 focus-within:ring-cta/15">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              disabled={!interactive || loading}
              className="h-full flex-1 bg-transparent text-[15px] font-bold text-ink outline-none placeholder:text-muted"
            />
            <button
              type="button"
              className="px-1 text-xs font-extrabold text-muted"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword ? t('auth.hidePassword') : t('auth.showPassword')
              }
            >
              {showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            </button>
          </div>
        </label>
      ) : null}

      <Button
        type="submit"
        label={
          showPasswordField
            ? t('auth.signIn')
            : resetSent
              ? t('auth.resendEmail')
              : t('auth.continue')
        }
        disabled={showPasswordField ? !canSignIn : !canContinue}
        loading={loading}
        className="mt-1 w-full"
        variant="primary"
      />

      {status.reasonKey ? (
        <FormError message={t(status.reasonKey)} tone="default" />
      ) : null}
    </form>
  )
}
