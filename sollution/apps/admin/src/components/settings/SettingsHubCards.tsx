import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui'
import { ReadOnlyRow } from '@/components/settings/SettingFields'
import type { SettingItemDto, SettingValue } from '@/api/OrderBooking/modules/settings'
import {
  displayValue,
  isDial,
  isStoreStatus,
  itemByKey,
  stringSetting,
} from '@/modules/settings/settings.helpers'

function valueOf(
  items: SettingItemDto[],
  key: string,
): SettingValue | undefined {
  return itemByKey(items, key)?.value
}

type CardProps = {
  items: SettingItemDto[]
}

export function BusinessSettingsCard({ items }: CardProps) {
  const { t } = useTranslation()
  const dialValue = valueOf(items, 'dial')
  const dial = isDial(dialValue) ? dialValue : null
  const vat = valueOf(items, 'vat_rate')
  const vatLabel =
    typeof vat === 'number'
      ? `${(vat * 100).toFixed(vat % 0.01 === 0 ? 0 : 2)}%`
      : '—'

  return (
    <article className="dash-panel flex flex-col p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Text as="h2" variant="bodyStrong" className="m-0 tracking-tight">
            {t('settings.hub.businessTitle')}
          </Text>
          <Text variant="caption" className="mt-1 text-muted">
            {t('settings.hub.businessBody')}
          </Text>
        </div>
        <Link
          to="/settings/business"
          className="inline-flex h-10 items-center rounded-pill border border-border bg-card px-4 text-sm font-bold text-ink shadow-sm transition hover:bg-surface"
        >
          {t('common.edit')}
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ReadOnlyRow
          label={t('settings.fields.businessName')}
          value={stringSetting(valueOf(items, 'business_name'))}
        />
        <ReadOnlyRow
          label={t('settings.fields.monogram')}
          value={stringSetting(valueOf(items, 'business_monogram'))}
        />
        <ReadOnlyRow
          label={t('settings.fields.orderPrefix')}
          value={stringSetting(valueOf(items, 'order_prefix'))}
        />
        <ReadOnlyRow
          label={t('settings.fields.currencyDisplay')}
          value={`${stringSetting(valueOf(items, 'currency_display'))} (${stringSetting(valueOf(items, 'currency_code')).toUpperCase()})`}
        />
        <ReadOnlyRow label={t('settings.fields.vatRate')} value={vatLabel} />
        <ReadOnlyRow
          label={t('settings.fields.dial')}
          value={dial ? displayValue(dial) : '—'}
        />
      </div>
    </article>
  )
}

export function OperationsSettingsCard({ items }: CardProps) {
  const { t } = useTranslation()
  const storeValue = valueOf(items, 'store_status')
  const store = isStoreStatus(storeValue) ? storeValue : null

  return (
    <article className="dash-panel flex flex-col p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Text as="h2" variant="bodyStrong" className="m-0 tracking-tight">
            {t('settings.hub.operationsTitle')}
          </Text>
          <Text variant="caption" className="mt-1 text-muted">
            {t('settings.hub.operationsBody')}
          </Text>
        </div>
        <Link
          to="/settings/operations"
          className="inline-flex h-10 items-center rounded-pill border border-border bg-card px-4 text-sm font-bold text-ink shadow-sm transition hover:bg-surface"
        >
          {t('common.edit')}
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ReadOnlyRow
          label={t('settings.fields.timezone')}
          value={stringSetting(valueOf(items, 'timezone'))}
        />
        <ReadOnlyRow
          label={t('settings.fields.storeAvailable')}
          value={
            store
              ? store.isAvailable
                ? t('settings.hub.storeOpen')
                : t('settings.hub.storeClosed')
              : '—'
          }
        />
        {store && !store.isAvailable ? (
          <>
            <ReadOnlyRow
              label={t('settings.fields.closedMessage')}
              value={store.closedMessage || '—'}
            />
            <ReadOnlyRow
              label={t('settings.fields.closedMessageArabic')}
              value={store.closedMessageArabic || '—'}
            />
          </>
        ) : null}
      </div>
    </article>
  )
}
