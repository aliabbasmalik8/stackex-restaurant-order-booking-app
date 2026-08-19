import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { isAppleAuthInteractive, shouldRenderAppleAuth } from '@/features/auth'

type AppleAuthButtonProps = {
  onPress?: () => void
  tone?: 'hero' | 'light'
}

function AppleMark({ light }: { light: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden
      fill={light ? 'currentColor' : '#fff'}
    >
      <path d="M12.6 8.4c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.8-3.1.8s-1.6-.7-2.7-.7c-1.4 0-2.7.8-3.4 2.1-1.5 2.5-.4 6.3 1 8.3.7 1 1.5 2.1 2.6 2 1 0 1.4-.7 2.7-.7s1.6.7 2.7.7 1.8-1 2.5-2c.8-1.1 1.1-2.2 1.1-2.3-.1 0-2.1-.8-2.2-3.4ZM10.5 2.6c.6-.7 1-1.7.9-2.6-.8 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.5 1 .1 1.9-.5 2.5-1.2Z" />
    </svg>
  )
}

export function AppleAuthButton({
  onPress,
  tone = 'light',
}: AppleAuthButtonProps) {
  const { t } = useTranslation()
  if (!shouldRenderAppleAuth()) return null

  return (
    <div className="flex flex-1 flex-col gap-2">
      <Button
        variant={tone === 'light' ? 'socialLight' : 'social'}
        label={t('auth.apple')}
        onClick={onPress}
        disabled={!isAppleAuthInteractive()}
        leftSlot={<AppleMark light={tone === 'light'} />}
        className="w-full"
      />
    </div>
  )
}
