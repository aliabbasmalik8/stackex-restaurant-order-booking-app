import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { StateBlock } from '@/components/layout/StateBlock'
import { FormSection } from '@/components/products/FormSection'
import { StatusBadge } from '@/components/settings/SettingFields'
import {
  StoreAvailabilityEditor,
  validateStoreStatus,
} from '@/components/settings/StoreAvailabilityEditor'
import { Button, SearchableSelect, Text } from '@/components/ui'
import { getTimezoneOptions } from '@/data/timezones'
import { isPublicPreviewMode } from '@/lib/previewMode'
import { useSettingsEditor } from '@/modules/settings'
import { OPERATIONS_SETTING_KEYS } from '@/modules/settings/settings.groups'
import {
  isStoreStatus,
  itemByKey,
  stringSetting,
} from '@/modules/settings/settings.helpers'

export function OperationsSettingsScreen() {
  const { t } = useTranslation()
  const [storeError, setStoreError] = useState<string | null>(null)
  const previewMode = isPublicPreviewMode()
  const {
    items,
    draft,
    loading,
    saving,
    error,
    flash,
    dirtyKeys,
    isDirty,
    refresh,
    setScalar,
    setStoreStatus,
    save,
  } = useSettingsEditor({ keys: OPERATIONS_SETTING_KEYS })

  const storeStatus = isStoreStatus(draft.store_status)
    ? draft.store_status
    : {
        isAvailable: true,
        closedMessage: '',
        closedMessageArabic: '',
      }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const validationKey = validateStoreStatus(storeStatus, {
      disableClosing: previewMode,
    })
    if (validationKey === 'preview_mode_store_lock') {
      setStoreError(t('settings.errors.previewModeStoreLock'))
      return
    }
    if (validationKey) {
      setStoreError(t('settings.errors.closedMessagesRequired'))
      return
    }
    setStoreError(null)
    await save()
  }

  const dirtySet = new Set(dirtyKeys)
  const badgeLabels = {
    override: t('settings.badge.override'),
    default: t('settings.badge.default'),
    changed: t('settings.badge.changed'),
  }
  const badgeFor = (key: string) => (
    <StatusBadge
      item={itemByKey(items, key)}
      dirty={dirtySet.has(key)}
      labels={badgeLabels}
    />
  )
  const labelFor = (key: string, fallback: string) =>
    itemByKey(items, key)?.label ?? fallback

  const timezoneOptions = useMemo(() => getTimezoneOptions(), [])

  return (
    <section>
      <PageHeader
        eyebrow={t('nav.settings')}
        title={t('settings.hub.operationsTitle')}
        subtitle={t('settings.hub.operationsBody')}
        action={
          <>
            <Link
              to="/settings"
              className="inline-flex h-10 items-center rounded-pill border border-border bg-card px-4 text-sm font-bold text-ink shadow-sm transition hover:bg-surface"
            >
              {t('common.back')}
            </Link>
            <Button
              type="submit"
              form="operations-settings-form"
              label={t('settings.save')}
              className="h-10 px-4 text-sm"
              loading={saving}
              disabled={!isDirty || loading}
            />
          </>
        }
      />

      {flash === 'saved' ? (
        <Text variant="caption" className="mb-3 block text-link">
          {t('settings.saved')}
        </Text>
      ) : null}

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
        onRetry={() => void refresh()}
      >
        <form
          id="operations-settings-form"
          onSubmit={(e) => void onSubmit(e)}
          className="dash-panel p-5 md:p-8"
        >
          <FormSection
            title={t('settings.sections.ops')}
            description={t('settings.sections.opsHint')}
          >
            <SearchableSelect
              className="sm:col-span-2"
              label={labelFor('timezone', t('settings.fields.timezone'))}
              name="timezone"
              value={stringSetting(draft.timezone)}
              options={timezoneOptions}
              onChange={(value) => setScalar('timezone', value)}
              placeholder={t('settings.timezone.select')}
              searchPlaceholder={t('settings.timezone.search')}
              emptyMessage={t('settings.timezone.empty')}
              hint={t('settings.hints.timezone')}
              badge={badgeFor('timezone')}
            />
          </FormSection>

          <FormSection
            title={t('settings.sections.store')}
            description={t('settings.sections.storeHint')}
          >
            <StoreAvailabilityEditor
              value={storeStatus}
              badge={badgeFor('store_status')}
              error={storeError}
              disableClosing={previewMode}
              onChange={(next) => {
                setStoreError(null)
                setStoreStatus(next)
              }}
            />
          </FormSection>

          <div className="mt-8 flex flex-wrap items-center justify-end gap-2 border-t border-divider pt-6">
            <Text variant="caption" className="me-auto text-muted">
              {isDirty
                ? t('settings.dirtyCount', { count: dirtyKeys.length })
                : t('settings.noChanges')}
            </Text>
            <Button
              type="submit"
              label={t('settings.save')}
              loading={saving}
              disabled={!isDirty}
            />
          </div>
        </form>
      </StateBlock>
    </section>
  )
}
