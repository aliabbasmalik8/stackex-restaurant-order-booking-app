import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import { Text } from '@/components/ui'
import { CheckboxField, TextAreaField } from '@/components/ui/FormControls'
import type { StoreStatusSetting } from '@/api/OrderBooking/modules/settings'

type StoreAvailabilityEditorProps = {
  value: StoreStatusSetting
  badge?: ReactNode
  error?: string | null
  /** When true, the store cannot be turned off (public preview). */
  disableClosing?: boolean
  onChange: (next: StoreStatusSetting) => void
}

export function StoreAvailabilityEditor({
  value,
  badge,
  error,
  disableClosing = false,
  onChange,
}: StoreAvailabilityEditorProps) {
  const { t } = useTranslation()

  const setAvailable = (isAvailable: boolean) => {
    if (!isAvailable && disableClosing) return
    if (isAvailable) {
      onChange({
        isAvailable: true,
        closedMessage: '',
        closedMessageArabic: '',
      })
      return
    }
    onChange({
      ...value,
      isAvailable: false,
    })
  }

  return (
    <div className="sm:col-span-2 grid gap-4">
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <CheckboxField
            label={t('settings.fields.storeAvailable')}
            name="store_available"
            checked={value.isAvailable}
            disabled={disableClosing && value.isAvailable}
            onChange={(e) => setAvailable(e.target.checked)}
          />
          {badge}
        </div>
        {disableClosing ? (
          <Text as="span" variant="caption" className="text-muted">
            {t('settings.hints.previewModeStoreLock')}
          </Text>
        ) : null}
      </div>

      {!value.isAvailable ? (
        <>
          <div>
            <TextAreaField
              label={`${t('settings.fields.closedMessage')} *`}
              name="closed_message"
              value={value.closedMessage}
              onChange={(e) =>
                onChange({ ...value, closedMessage: e.target.value })
              }
              rows={2}
              required
              disabled={disableClosing}
            />
            <Text
              as="span"
              variant="caption"
              className="mt-1 block ps-1.5 text-muted"
            >
              {t('settings.hints.closedMessageRequired')}
            </Text>
          </div>
          <div dir="rtl">
            <TextAreaField
              label={`${t('settings.fields.closedMessageArabic')} *`}
              name="closed_message_arabic"
              value={value.closedMessageArabic}
              onChange={(e) =>
                onChange({ ...value, closedMessageArabic: e.target.value })
              }
              rows={2}
              required
              disabled={disableClosing}
            />
          </div>
          {error ? (
            <Text as="span" variant="caption" className="text-error">
              {error}
            </Text>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

export function validateStoreStatus(
  value: StoreStatusSetting,
  options?: { disableClosing?: boolean },
): string | null {
  if (options?.disableClosing && !value.isAvailable) {
    return 'preview_mode_store_lock'
  }
  if (value.isAvailable) return null
  if (!value.closedMessage.trim() || !value.closedMessageArabic.trim()) {
    return 'closed_messages_required'
  }
  return null
}
