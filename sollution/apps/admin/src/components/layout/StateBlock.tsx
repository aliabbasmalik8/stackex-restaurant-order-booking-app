import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Text } from '@/components/ui'
import { getErrorMessage } from '@/lib/getErrorMessage'

type StateBlockProps = {
  loading?: boolean
  /** Pre-resolved display string (optional if `errorCause` is set). */
  error?: string | null
  /** Raw API / thrown error — prefers backend `user_error_detail`. */
  errorCause?: unknown
  empty?: boolean
  emptyTitle?: string
  emptyBody?: string
  onRetry?: () => void
  stateClassName?: string
  children: ReactNode
}

export function StateBlock({
  loading,
  error,
  errorCause,
  empty,
  emptyTitle,
  emptyBody,
  onRetry,
  stateClassName = '',
  children,
}: StateBlockProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Text
        variant="subtitle"
        className={['dash-panel block py-12 text-center text-sub', stateClassName]
          .filter(Boolean)
          .join(' ')}
      >
        {t('common.loading')}
      </Text>
    )
  }

  const resolvedError =
    errorCause != null
      ? getErrorMessage(errorCause, error ?? t('errors.unknown'))
      : error

  if (resolvedError) {
    return (
      <div
        className={[
          'dash-panel flex flex-col items-center gap-4 py-12 text-center',
          stateClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Text variant="body" className="text-error">
          {resolvedError}
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
      <div
        className={['dash-panel py-12 text-center', stateClassName]
          .filter(Boolean)
          .join(' ')}
      >
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
