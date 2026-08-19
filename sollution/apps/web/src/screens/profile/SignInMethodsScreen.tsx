import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { FormError, Text } from '@/components/ui'
import { SignInMethodRow } from '@/feature-ui/auth'
import {
  AuthError,
  authErrorMessageKey,
  toAuthError,
  useConnectGoogle,
  useSignInMethods,
} from '@/core/auth'
import { useAuth } from '@/context/AuthContext'
import {
  isGoogleAuthInteractive,
  shouldRenderGoogleAuth,
} from '@/features/auth'
import { ProfileSubpage } from './ProfileSubpage'

export function SignInMethodsScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const methods = useSignInMethods()
  const { connectGoogle, loading: connecting } = useConnectGoogle()
  const [errorKey, setErrorKey] = useState<string | null>(null)

  const email = methods.email ?? profile?.email ?? null
  const showGoogle = shouldRenderGoogleAuth() || methods.isGoogleConnected
  const googleInteractive = isGoogleAuthInteractive()
  const canManage = methods.hasFirebaseSession

  const onConnectGoogle = async () => {
    setErrorKey(null)
    try {
      await connectGoogle()
      await methods.refresh()
    } catch (error) {
      const authErr = error instanceof AuthError ? error : toAuthError(error)
      setErrorKey(authErrorMessageKey(authErr.code))
    }
  }

  return (
    <ProfileSubpage title={t('profile.signInMethods')}>
      <Text variant="subtitle" className="text-sub">
        {t('profile.signInMethodsSubtitle')}
      </Text>

      <div className="mt-5 rounded-[20px] bg-card px-[17px] py-4 shadow-card">
        <p className="text-[12.5px] font-semibold text-sub">
          {t('profile.emailReadOnly')}
        </p>
        <p className="mt-1 text-[15px] font-bold">
          {email ?? t('profile.emailMissing')}
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-[20px] bg-card shadow-card">
        <SignInMethodRow
          label={t('auth.password')}
          hint={
            methods.hasPassword
              ? t('profile.passwordSetHint')
              : t('profile.passwordAddHint')
          }
          actionLabel={
            methods.hasPassword
              ? t('profile.changePassword')
              : t('profile.addPassword')
          }
          onPress={() =>
            navigate(
              methods.hasPassword
                ? '/profile/change-password'
                : '/profile/add-password',
            )
          }
          last={!showGoogle}
        />
        {showGoogle ? (
          <SignInMethodRow
            label={t('auth.google')}
            hint={
              methods.isGoogleConnected
                ? t('profile.googleConnectedHint')
                : t('profile.googleConnectHint')
            }
            actionLabel={
              connecting
                ? t('common.loading')
                : methods.isGoogleConnected
                  ? t('profile.googleConnected')
                  : t('profile.connectGoogle')
            }
            onPress={
              methods.isGoogleConnected
                ? undefined
                : () => void onConnectGoogle()
            }
            disabled={
              connecting || methods.isGoogleConnected || !googleInteractive
            }
            last
          />
        ) : null}
      </div>

      {!canManage && methods.ready ? (
        <p className="mt-4 text-[13px] font-semibold leading-snug text-muted">
          {t('profile.noFirebaseSession')}
        </p>
      ) : null}

      <FormError message={errorKey ? t(errorKey) : null} />
    </ProfileSubpage>
  )
}
