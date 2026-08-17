import { useTranslation } from 'react-i18next'
import { OrDivider } from '@/components/ui'
import { shouldRenderAppleAuth, shouldRenderGoogleAuth } from '@/features/auth'
import { AppleAuthButton } from './AppleAuthButton'
import { GoogleAuthButton } from './GoogleAuthButton'

type SocialLoginButtonsProps = {
  onApple?: () => void | Promise<void>
  onGoogle?: () => void | Promise<void>
  tone?: 'hero' | 'light'
}

export function SocialLoginButtons({
  onApple,
  onGoogle,
  tone = 'light',
}: SocialLoginButtonsProps) {
  const { t } = useTranslation()
  const show = shouldRenderAppleAuth() || shouldRenderGoogleAuth()

  if (!show) return null

  return (
    <div className="mt-7 flex flex-col gap-3.5">
      <OrDivider label={t('auth.orContinueWith')} tone={tone} />
      <div className="flex gap-3">
        <AppleAuthButton onPress={onApple} tone={tone} />
        <GoogleAuthButton onPress={onGoogle} tone={tone} />
      </div>
    </div>
  )
}
