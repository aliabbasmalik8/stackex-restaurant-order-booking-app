import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui'
import {
  PasswordLoginForm,
  SocialLoginButtons,
  type PasswordLoginValues,
} from '@/feature-ui/auth'
import { shouldRenderPasswordAuth } from '@/features/auth'
import { AuthSplitLayout } from './AuthSplitLayout'

interface SignInScreenProps {
  onPasswordSignIn?: (values: PasswordLoginValues) => void | Promise<void>
  onApple?: () => void | Promise<void>
  onGoogle?: () => void | Promise<void>
  onCreateAccount?: () => void
  onForgotPassword?: () => void
  onContinueAsGuest?: () => void
}

export function SignInScreen({
  onPasswordSignIn,
  onApple,
  onGoogle,
  onCreateAccount,
  onForgotPassword,
  onContinueAsGuest,
}: SignInScreenProps) {
  const { t } = useTranslation()

  return (
    <AuthSplitLayout>
      <Text as="h1" variant="display" className="text-[32px]">
        {t('auth.welcomeBack')}
      </Text>
      <Text variant="subtitle" className="mt-2 text-sub">
        {t('auth.signInSubtitle')}
      </Text>

      {shouldRenderPasswordAuth() ? (
        <PasswordLoginForm onSubmit={onPasswordSignIn} tone="light" />
      ) : null}

      <SocialLoginButtons onApple={onApple} onGoogle={onGoogle} tone="light" />

      <div className="mt-10 flex flex-col items-center gap-3">
        {shouldRenderPasswordAuth() ? (
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-[13.5px] font-bold text-sub"
          >
            {t('auth.forgotPassword')}
          </button>
        ) : null}
        <p className="text-[13.5px] font-bold text-sub">
          {t('auth.newHere')}{' '}
          <button
            type="button"
            onClick={onCreateAccount}
            className="font-extrabold text-cta"
          >
            {t('auth.createAccount')}
          </button>
        </p>
        <button
          type="button"
          onClick={onContinueAsGuest}
          className="text-[13px] font-bold text-muted"
        >
          {t('auth.continueAsGuest')}
        </button>
      </div>
    </AuthSplitLayout>
  )
}
