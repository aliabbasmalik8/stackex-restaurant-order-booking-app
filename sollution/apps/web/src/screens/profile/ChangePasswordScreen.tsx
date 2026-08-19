import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button, FormError, Text } from '@/components/ui'
import { PasswordField } from '@/feature-ui/auth'
import {
  AuthError,
  authErrorMessageKey,
  changeAccountPassword,
  toAuthError,
  useSignInMethods,
} from '@/core/auth'
import { useAuth } from '@/context/AuthContext'
import { ProfileSubpage } from './ProfileSubpage'

const PREVIEW_LOCK_EMAILS = ['test@stackex.ai', 'test@example.com']

export function ChangePasswordScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { email, refresh } = useSignInMethods()
  const accountEmail = email ?? profile?.email
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorKey, setErrorKey] = useState<string | null>(null)

  const match = next.length > 0 && next === confirm
  const canSave =
    !saving &&
    current.trim().length >= 6 &&
    next.trim().length >= 6 &&
    match

  const onSave = async (event: FormEvent) => {
    event.preventDefault()
    if (!canSave) return
    setSaving(true)
    setErrorKey(null)
    if (PREVIEW_LOCK_EMAILS.includes((accountEmail ?? '').trim().toLowerCase())) {
      setErrorKey('auth.errors.password_reset_not_allowed')
      setSaving(false)
      return
    }
    try {
      await changeAccountPassword({
        email: accountEmail,
        currentPassword: current,
        nextPassword: next,
      })
      await refresh()
      navigate('/profile/sign-in', { replace: true })
    } catch (error) {
      const authErr = error instanceof AuthError ? error : toAuthError(error)
      setErrorKey(authErrorMessageKey(authErr.code))
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProfileSubpage title={t('profile.changePasswordTitle')}>
      <form className="flex flex-col gap-4" onSubmit={(e) => void onSave(e)}>
        <Text variant="subtitle" className="text-sub">
          {t('profile.changePasswordSubtitle')}
        </Text>
        <PasswordField
          label={t('profile.currentPassword')}
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder={t('auth.passwordPlaceholder')}
          autoComplete="current-password"
          disabled={saving}
        />
        <PasswordField
          label={t('profile.newPassword')}
          value={next}
          onChange={(e) => setNext(e.target.value)}
          placeholder={t('auth.passwordPlaceholder')}
          autoComplete="new-password"
          disabled={saving}
        />
        <PasswordField
          label={t('auth.confirmPassword')}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={t('auth.confirmPasswordPlaceholder')}
          autoComplete="new-password"
          disabled={saving}
          error={
            confirm.length > 0 && !match ? t('auth.passwordMismatch') : null
          }
        />
        <FormError message={errorKey ? t(errorKey) : null} />
        <Button
          type="submit"
          label={t('profile.savePassword')}
          loading={saving}
          disabled={!canSave}
          className="mt-2 w-full"
        />
      </form>
    </ProfileSubpage>
  )
}
