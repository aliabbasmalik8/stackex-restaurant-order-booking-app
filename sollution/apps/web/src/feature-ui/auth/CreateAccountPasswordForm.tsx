import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Checkbox, Field, FormError, Text } from '@/components/ui'
import { AuthError, authErrorMessageKey, toAuthError } from '@/core/auth'
import {
  getPasswordAuthStatus,
  isPasswordAuthInteractive,
} from '@/features/auth'

export type CreateAccountPasswordValues = {
  name: string
  email: string
  password: string
  whatsappOffers: boolean
}

type CreateAccountPasswordFormProps = {
  onSubmit?: (values: CreateAccountPasswordValues) => void | Promise<void>
}

export function CreateAccountPasswordForm({
  onSubmit,
}: CreateAccountPasswordFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [whatsappOffers, setWhatsappOffers] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const status = getPasswordAuthStatus()
  const interactive = isPasswordAuthInteractive()

  const passwordsMatch = password.length > 0 && password === confirm
  const canSubmit =
    interactive &&
    !loading &&
    name.trim().length > 1 &&
    email.trim().includes('@') &&
    password.trim().length >= 6 &&
    passwordsMatch

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setErrorKey(null)
    try {
      await onSubmit?.({
        name: name.trim(),
        email: email.trim(),
        password,
        whatsappOffers,
      })
    } catch (error) {
      const authErr = error instanceof AuthError ? error : toAuthError(error)
      setErrorKey(authErrorMessageKey(authErr.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-3.5" onSubmit={(e) => void handleSubmit(e)}>
      <div className="flex flex-col gap-3">
        <Field
          label={t('auth.fullName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('auth.namePlaceholder')}
          autoComplete="name"
          disabled={!interactive || loading}
        />
        <Field
          label={t('auth.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('auth.emailPlaceholder')}
          type="email"
          autoComplete="email"
          disabled={!interactive || loading}
        />

        <label className="flex flex-col gap-1.5">
          <Text as="span" variant="label" className="ps-1.5">
            {t('auth.password')}
          </Text>
          <div className="flex h-[58px] items-center rounded-[16px] border-[1.5px] border-border bg-card px-[18px] focus-within:border-cta focus-within:ring-2 focus-within:ring-cta/15">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              disabled={!interactive || loading}
              className="h-full flex-1 bg-transparent text-[15px] font-bold text-ink outline-none placeholder:text-muted"
            />
            <button
              type="button"
              className="px-1 text-xs font-extrabold text-muted"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            </button>
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <Text as="span" variant="label" className="ps-1.5">
            {t('auth.confirmPassword')}
          </Text>
          <div className="flex h-[58px] items-center rounded-[16px] border-[1.5px] border-border bg-card px-[18px] focus-within:border-cta focus-within:ring-2 focus-within:ring-cta/15">
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              disabled={!interactive || loading}
              className="h-full flex-1 bg-transparent text-[15px] font-bold text-ink outline-none placeholder:text-muted"
            />
          </div>
          {confirm.length > 0 && !passwordsMatch ? (
            <Text as="span" variant="caption" className="ps-1.5 text-error">
              {t('auth.passwordMismatch')}
            </Text>
          ) : null}
        </label>

        <Checkbox
          checked={whatsappOffers}
          onChange={setWhatsappOffers}
          label={t('auth.whatsappOffers')}
        />
      </div>

      <FormError message={errorKey ? t(errorKey) : null} />

      <Button
        type="submit"
        label={t('auth.createAccountCta')}
        disabled={!canSubmit}
        loading={loading}
        className="w-full"
      />

      {status.reasonKey ? (
        <FormError message={t(status.reasonKey)} tone="default" />
      ) : null}
    </form>
  )
}
