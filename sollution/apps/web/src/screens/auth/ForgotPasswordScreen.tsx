import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Field, Text } from '@/components/ui'
import {
  AuthError,
  authErrorMessageKey,
  lookupEmailAuthStatus,
  sendPasswordReset,
  toAuthError,
} from '@/core/auth'

type ForgotPasswordScreenProps = {
  onBack?: () => void
}

export function ForgotPasswordScreen({ onBack }: ForgotPasswordScreenProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)

  const emailValid = email.trim().includes('@')
  const canSend = emailValid && !loading

  const handleSend = async (event: FormEvent) => {
    event.preventDefault()
    if (!canSend) return
    setLoading(true)
    setErrorKey(null)
    try {
      const status = await lookupEmailAuthStatus(email)
      if (status === 'account-not-exist') {
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

  return (
    <main className="min-h-full bg-page">
      <div className="mx-auto flex min-h-full max-w-[480px] flex-col px-6 py-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 size-[38px] rounded-full bg-surface text-lg text-sub"
          aria-label={t('common.back')}
        >
          ‹
        </button>

        <Text as="h1" variant="title">
          {t('auth.forgotPasswordTitle')}
        </Text>
        <Text variant="subtitle" className="mt-1.5 text-sub">
          {t('auth.forgotPasswordSubtitle')}
        </Text>

        <form className="mt-8 flex flex-col gap-4" onSubmit={(e) => void handleSend(e)}>
          {errorKey || resetSent ? (
            <p
              className={[
                'rounded-md px-3 py-2 text-[13px] font-semibold',
                errorKey ? 'bg-red-50 text-error' : 'bg-emerald-50 text-emerald-800',
              ].join(' ')}
            >
              {errorKey ? t(errorKey) : t('auth.passwordResetSent')}
            </p>
          ) : null}

          <Field
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setErrorKey(null)
              setResetSent(false)
            }}
            placeholder={t('auth.emailPlaceholder')}
            disabled={loading}
          />

          <Button
            type="submit"
            label={resetSent ? t('auth.resendEmail') : t('auth.sendResetEmail')}
            disabled={!canSend}
            loading={loading}
            className="w-full"
          />
        </form>
      </div>
    </main>
  )
}
