import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import { Text } from '@/components/ui'
import { CheckboxField, TextAreaField } from '@/components/ui/FormControls'
import type { StoreStatusSetting } from '@/api/OrderBooking/modules/settings'

type StoreAvailabilityEditorProps = {
  value: StoreStatusSetting
  badge?: ReactNode
  error?: string | null
  onChange: (next: StoreStatusSetting) => void
}

export function StoreAvailabilityEditor({
  value,
  badge,
  error,
  onChange,
}: StoreAvailabilityEditorProps) {
  const { t } = useTranslation()

  const setAvailable = (isAvailable: boolean) => {
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
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3">
        <CheckboxField
          label={t('settings.fields.storeAvailable')}
          name="store_available"
          checked={value.isAvailable}
          onChange={(e) => setAvailable(e.target.checked)}
        />
        {badge}
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
): string | null {
  if (value.isAvailable) return null
  if (!value.closedMessage.trim() || !value.closedMessageArabic.trim()) {
    return 'closed_messages_required'
  }
  return null
}
