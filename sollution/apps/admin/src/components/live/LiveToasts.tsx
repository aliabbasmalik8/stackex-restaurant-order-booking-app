import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui'

export type LiveToast = {
  id: string
  orderId?: string
  title: string
  body: string
}

type Props = {
  toasts: LiveToast[]
  onDismiss: (id: string) => void
  onOpen: (toast: LiveToast) => void
}

export function LiveToasts({ toasts, onDismiss, onOpen }: Props) {
  const { t } = useTranslation()
  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[90] flex flex-col items-end gap-2 px-4 sm:inset-x-auto sm:end-4 sm:start-auto sm:w-80">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto w-full rounded-2xl border border-border bg-card p-4 shadow-lg"
        >
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              className="min-w-0 flex-1 text-start"
              onClick={() => onOpen(toast)}
            >
              <Text variant="bodyStrong">{toast.title}</Text>
              <Text variant="caption" className="mt-1 text-muted">
                {toast.body}
              </Text>
              <span className="mt-2 block font-sans text-xs font-bold text-link">
                {t('live.viewOrders')}
              </span>
            </button>
            <button
              type="button"
              className="shrink-0 font-sans text-xs font-bold text-muted"
              onClick={() => onDismiss(toast.id)}
            >
              {t('live.dismiss')}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
