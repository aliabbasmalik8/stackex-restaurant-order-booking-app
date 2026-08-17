import { useTranslation } from 'react-i18next'
import { errorMessageKey, errorTitleKey, type AppErrorCode } from '@/lib/errors'
import { getErrorMessage } from '@/lib/errors'
import { Button } from './Button'
import { Text } from './Text'

type StateMessageProps = {
  errorCode: AppErrorCode
  error?: unknown
  onAction?: () => void
}

export function StateMessage({
  errorCode,
  error,
  onAction,
}: StateMessageProps) {
  const { t } = useTranslation()
  const title = t(errorTitleKey(errorCode))
  const message = getErrorMessage(error, t(errorMessageKey(errorCode)))

  return (
    <div className="flex max-w-md flex-col items-center gap-3 px-6 py-16 text-center">
      <Text variant="title">{title}</Text>
      <Text variant="subtitle" className="text-sub">
        {message}
      </Text>
      {onAction ? (
        <Button
          variant="secondary"
          label={t('common.retry')}
          onClick={onAction}
          className="mt-2"
        />
      ) : null}
    </div>
  )
}
