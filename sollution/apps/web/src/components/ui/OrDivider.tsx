import { Text } from '@/components/ui/Text'

export function OrDivider({
  label,
  tone = 'hero',
}: {
  label: string
  tone?: 'hero' | 'light'
}) {
  const line = tone === 'hero' ? 'bg-white/20' : 'bg-divider'
  const text = tone === 'hero' ? 'text-white/55' : 'text-muted'

  return (
    <div className="flex items-center gap-3">
      <span className={`h-px flex-1 ${line}`} />
      <Text as="span" variant="caption" className={text}>
        {label}
      </Text>
      <span className={`h-px flex-1 ${line}`} />
    </div>
  )
}
