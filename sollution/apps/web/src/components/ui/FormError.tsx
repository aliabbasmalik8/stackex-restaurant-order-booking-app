import { Text } from '@/components/ui/Text'

type Tone = 'error' | 'onHero' | 'default'

export function FormError({
  message,
  tone = 'error',
}: {
  message?: string | null
  tone?: Tone
}) {
  if (!message) return null

  const color =
    tone === 'onHero'
      ? 'text-white/90'
      : tone === 'error'
        ? 'text-error'
        : 'text-sub'

  return (
    <Text variant="caption" className={color} role="alert">
      {message}
    </Text>
  )
}
