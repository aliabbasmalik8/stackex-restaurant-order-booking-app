import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui'
import {
  CreateAccountPasswordForm,
  type CreateAccountPasswordValues,
} from '@/feature-ui/auth'
import { shouldRenderPasswordAuth } from '@/features/auth'
import { AuthSplitLayout } from './AuthSplitLayout'

interface SignUpScreenProps {
  onBack?: () => void
  onSignIn?: () => void
  onSubmitPassword?: (
    values: CreateAccountPasswordValues,
  ) => void | Promise<void>
}

export function SignUpScreen({
  onBack,
  onSignIn,
  onSubmitPassword,
}: SignUpScreenProps) {
  const { t } = useTranslation()
  const showPassword = shouldRenderPasswordAuth()

  return (
    <AuthSplitLayout>
      <Text as="h1" variant="display" className="text-[32px]">
        {t('auth.signUpTitle')}
      </Text>
      <Text variant="subtitle" className="mt-2 text-sub">
        {t('auth.signUpSubtitle')}
      </Text>

      <div className="mt-7">
        {showPassword ? (
          <CreateAccountPasswordForm onSubmit={onSubmitPassword} />
        ) : null}
      </div>

      <div className="mt-10 flex flex-col items-center gap-3">
        <p className="text-[13.5px] font-bold text-sub">
          {t('auth.alreadyHaveAccount')}{' '}
          <button
            type="button"
            onClick={onSignIn ?? onBack}
            className="font-extrabold text-cta"
          >
            {t('auth.signIn')}
          </button>
        </p>
        <p className="max-w-[320px] text-center text-xs font-semibold leading-relaxed text-muted">
          {t('auth.termsPrefix')}
          <span className="font-extrabold text-ink">{t('auth.terms')}</span>
          {t('auth.and')}
          <span className="font-extrabold text-ink">{t('auth.privacy')}</span>
        </p>
      </div>
    </AuthSplitLayout>
  )
}
