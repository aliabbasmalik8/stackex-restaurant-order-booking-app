import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { StateBlock } from '@/components/layout/StateBlock'
import {
  BusinessSettingsCard,
  OperationsSettingsCard,
} from '@/components/settings/SettingsHubCards'
import { Button, Text } from '@/components/ui'
import { useSettingsList } from '@/api/OrderBooking/modules/settings'
import { getErrorMessage } from '@/lib/getErrorMessage'

export function SettingsScreen() {
  const { t } = useTranslation()
  const listQuery = useSettingsList()
  const items = listQuery.data ?? []
  const loading = listQuery.isLoading
  const error = listQuery.error
    ? getErrorMessage(listQuery.error, t('errors.loadSettings'))
    : null

  return (
    <section>
      <PageHeader
        eyebrow={t('nav.main')}
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        action={
          <Button
            label={t('common.refresh')}
            variant="secondary"
            className="h-10 px-4 text-sm"
            onClick={() => void listQuery.refetch()}
            disabled={loading}
          />
        }
      />

      {error && !loading ? (
        <Text variant="caption" className="mb-3 block text-error">
          {error}
        </Text>
      ) : null}

      <StateBlock
        loading={loading}
        error={null}
        empty={items.length === 0}
        emptyTitle={t('settings.emptyTitle')}
        emptyBody={t('settings.emptyBody')}
        onRetry={() => void listQuery.refetch()}
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <BusinessSettingsCard items={items} />
          <OperationsSettingsCard items={items} />
        </div>
      </StateBlock>
    </section>
  )
}
