import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Text } from '@/components/ui'

type StateBlockProps = {
  loading?: boolean
  error?: string | null
  empty?: boolean
  emptyTitle?: string
  emptyBody?: string
  onRetry?: () => void
  children: ReactNode
}

export function StateBlock({
  loading,
  error,
  empty,
  emptyTitle,
  emptyBody,
  onRetry,
  children,
}: StateBlockProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Text variant="subtitle" className="py-12 text-center text-sub">
        {t('common.loading')}
      </Text>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <Text variant="body" className="text-error">
          {error}
        </Text>
        {onRetry ? (
          <Button
            label={t('common.retry')}
            variant="secondary"
            onClick={onRetry}
          />
        ) : null}
      </div>
    )
  }

  if (empty) {
    return (
      <div className="py-12 text-center">
        <Text variant="bodyStrong" className="mb-1">
          {emptyTitle ?? t('common.emptyTitle')}
        </Text>
        {emptyBody ? (
          <Text variant="subtitle" className="text-sub">
            {emptyBody}
          </Text>
        ) : null}
      </div>
    )
  }

  return <>{children}</>
}
