import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button, FormError, Text } from '@/components/ui'
import { PasswordField } from '@/feature-ui/auth'
import {
  AuthError,
  addPasswordToAccount,
  authErrorMessageKey,
  signInWithGooglePopup,
  toAuthError,
  useSignInMethods,
  waitForFirebaseUser,
} from '@/core/auth'
import { useAuth } from '@/context/AuthContext'
import { ProfileSubpage } from './ProfileSubpage'

export function AddPasswordScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { email, refresh } = useSignInMethods()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorKey, setErrorKey] = useState<string | null>(null)

  const displayEmail = email ?? profile?.email
  const match = password.length > 0 && password === confirm
  const canSave =
    !saving && password.trim().length >= 6 && match && Boolean(displayEmail)

  const onSave = async (event: FormEvent) => {
    event.preventDefault()
    if (!canSave) return
    setSaving(true)
    setErrorKey(null)
    try {
      const firebaseUser = await waitForFirebaseUser()
      if (!firebaseUser) {
        await signInWithGooglePopup()
      }
      await addPasswordToAccount(password)
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
    <ProfileSubpage title={t('profile.addPasswordTitle')}>
      <form className="flex flex-col gap-4" onSubmit={(e) => void onSave(e)}>
        <Text variant="subtitle" className="text-sub">
          {t('profile.addPasswordSubtitle')}
        </Text>
        {displayEmail ? (
          <div className="rounded-[16px] bg-card px-[18px] py-3.5 shadow-card">
            <p className="text-[12.5px] font-semibold text-sub">
              {t('profile.emailReadOnly')}
            </p>
            <p className="mt-1 text-[15px] font-bold">{displayEmail}</p>
          </div>
        ) : (
          <FormError message={t('profile.emailMissing')} />
        )}
        <PasswordField
          label={t('profile.newPassword')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
