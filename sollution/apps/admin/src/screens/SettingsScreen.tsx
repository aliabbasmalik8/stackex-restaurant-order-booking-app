import type { FormEvent, InputHTMLAttributes, ReactNode } from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { StateBlock } from '@/components/layout/StateBlock'
import { FormSection } from '@/components/products/FormSection'
import { Button, SearchableSelect, Text } from '@/components/ui'
import {
  type DialSetting,
  type SettingItemDto,
  type SettingValue,
} from '@/api/OrderBooking/modules/settings'
import {
  CURRENCIES,
  currencyDisplayFor,
} from '@/data/currencies'
import { DIAL_COUNTRIES, dialFromRegion } from '@/data/dialCountries'
import { getTimezoneOptions } from '@/data/timezones'
import { useSettingsEditor } from '@/modules/settings'

function isDial(value: SettingValue | undefined): value is DialSetting {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const o = value as Record<string, unknown>
  return (
    typeof o.code === 'string' &&
    typeof o.region === 'string' &&
    typeof o.flag === 'string'
  )
}

function itemByKey(
  items: SettingItemDto[],
  key: string,
): SettingItemDto | undefined {
  return items.find((i) => i.key === key)
}

function StatusBadge({
  item,
  dirty,
  labels,
}: {
  item?: SettingItemDto
  dirty: boolean
  labels: { override: string; default: string; changed: string }
}) {
  if (!item) return null
  const text = dirty
    ? labels.changed
    : item.isOverride
      ? labels.override
      : labels.default
  const tone = dirty
    ? 'bg-cta/15 text-ink'
    : item.isOverride
      ? 'bg-badge text-badge-text'
      : 'bg-surface text-muted ring-1 ring-border'
  return (
    <span
      className={`inline-flex rounded-pill px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${tone}`}
    >
      {text}
    </span>
  )
}

function SettingField({
  label,
  badge,
  hint,
  className = '',
  ...inputProps
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  badge?: ReactNode
  hint?: string
}) {
  const fieldId = inputProps.id ?? inputProps.name
  return (
    <label className={`flex flex-col gap-1.5 ${className}`} htmlFor={fieldId}>
      <span className="flex items-center justify-between gap-2 ps-1.5">
        <Text as="span" variant="label" className="m-0">
          {label}
        </Text>
        {badge}
      </span>
      <input
        id={fieldId}
        className={[
          'h-14 rounded-lg border border-border bg-card px-[18px] text-[15px] text-ink',
          'placeholder:text-muted outline-none',
          'focus:border-cta focus:ring-2 focus:ring-cta/20',
          'font-semibold',
        ].join(' ')}
        {...inputProps}
      />
      {hint ? (
        <Text as="span" variant="caption" className="ps-1.5 text-muted">
          {hint}
        </Text>
      ) : null}
    </label>
  )
}

export function SettingsScreen() {
  const { t } = useTranslation()
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
    setDial,
    save,
  } = useSettingsEditor()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await save()
  }

  const dial = isDial(draft.dial)
    ? draft.dial
    : { code: '', region: '', flag: '' }
  const stringVal = (key: string) =>
    typeof draft[key] === 'string' ? (draft[key] as string) : ''
  const numberVal = (key: string) =>
    typeof draft[key] === 'number' ? String(draft[key]) : ''

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

  const currencyOptions = CURRENCIES.map((c) => ({
    value: c.code,
    label: c.label,
    description: c.name,
    searchText: `${c.code} ${c.label} ${c.name}`,
  }))

  const dialOptions = DIAL_COUNTRIES.map((c) => ({
    value: c.region,
    label: `${c.flag}  ${c.region}`,
    description: `${c.name} · ${c.code}`,
    searchText: `${c.region} ${c.name} ${c.code} ${c.flag}`,
  }))

  const timezoneOptions = useMemo(() => getTimezoneOptions(), [])

  const onCurrencyCodeChange = (code: string) => {
    setScalar('currency_code', code)
    setScalar('currency_display', currencyDisplayFor(code))
  }

  const onDialRegionChange = (region: string) => {
    const next = dialFromRegion(region)
    if (next) setDial(next)
  }

  return (
    <section>
      <PageHeader
        eyebrow={t('nav.main')}
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        action={
          <>
            <Button
              label={t('common.refresh')}
              variant="secondary"
              className="h-10 px-4 text-sm"
              onClick={() => void refresh()}
              disabled={loading || saving}
            />
            <Button
              type="submit"
              form="settings-form"
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
          id="settings-form"
          onSubmit={(e) => void onSubmit(e)}
          className="dash-panel p-5 md:p-8"
        >
          <FormSection
            title={t('settings.sections.business')}
            description={t('settings.sections.businessHint')}
          >
            <SettingField
              className="sm:col-span-2"
              label={labelFor('business_name', t('settings.fields.businessName'))}
              name="business_name"
              value={stringVal('business_name')}
              onChange={(e) => setScalar('business_name', e.target.value)}
              badge={badgeFor('business_name')}
            />
            <SettingField
              label={labelFor(
                'business_monogram',
                t('settings.fields.monogram'),
              )}
              name="business_monogram"
              value={stringVal('business_monogram')}
              onChange={(e) => setScalar('business_monogram', e.target.value)}
              maxLength={4}
              badge={badgeFor('business_monogram')}
            />
            <SettingField
              label={labelFor('order_prefix', t('settings.fields.orderPrefix'))}
              name="order_prefix"
              value={stringVal('order_prefix')}
              onChange={(e) => setScalar('order_prefix', e.target.value)}
              maxLength={8}
              badge={badgeFor('order_prefix')}
            />
          </FormSection>

          <FormSection
            title={t('settings.sections.commerce')}
            description={t('settings.sections.commerceHint')}
          >
            <SearchableSelect
              label={labelFor(
                'currency_code',
                t('settings.fields.currencyCode'),
              )}
              name="currency_code"
              value={stringVal('currency_code')}
              options={currencyOptions}
              onChange={onCurrencyCodeChange}
              placeholder={t('settings.currency.select')}
              searchPlaceholder={t('settings.currency.search')}
              emptyMessage={t('settings.currency.empty')}
              badge={badgeFor('currency_code')}
            />
            <SettingField
              label={labelFor(
                'currency_display',
                t('settings.fields.currencyDisplay'),
              )}
              name="currency_display"
              value={stringVal('currency_display')}
              onChange={(e) => setScalar('currency_display', e.target.value)}
              placeholder="AED"
              hint={t('settings.hints.currencyDisplay')}
              badge={badgeFor('currency_display')}
            />
            <SettingField
              className="sm:col-span-2"
              label={labelFor('vat_rate', t('settings.fields.vatRate'))}
              name="vat_rate"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={numberVal('vat_rate')}
              onChange={(e) => {
                const n = Number(e.target.value)
                setScalar('vat_rate', Number.isFinite(n) ? n : 0)
              }}
              hint={t('settings.hints.vatRate')}
              badge={badgeFor('vat_rate')}
            />
          </FormSection>

          <FormSection
            title={t('settings.sections.phone')}
            description={t('settings.sections.phoneHint')}
          >
            <SearchableSelect
              className="sm:col-span-2"
              label={labelFor('dial', t('settings.fields.dialRegion'))}
              name="dial_region"
              value={dial.region}
              options={dialOptions}
              onChange={onDialRegionChange}
              placeholder={t('settings.dial.select')}
              searchPlaceholder={t('settings.dial.search')}
              emptyMessage={t('settings.dial.empty')}
              hint={t('settings.hints.dialRegion')}
              badge={badgeFor('dial')}
            />
            <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface px-4 py-3">
                <Text as="span" variant="label" className="m-0 text-muted">
                  {t('settings.fields.dialCode')}
                </Text>
                <Text as="p" variant="bodyStrong" className="m-0 mt-1 tracking-wide">
                  {dial.code || '—'}
                </Text>
              </div>
              <div className="rounded-lg border border-border bg-surface px-4 py-3">
                <Text as="span" variant="label" className="m-0 text-muted">
                  {t('settings.fields.dialFlag')}
                </Text>
                <Text as="p" variant="bodyStrong" className="m-0 mt-1 text-xl">
                  {dial.flag || '—'}
                </Text>
              </div>
            </div>
          </FormSection>

          <FormSection
            title={t('settings.sections.ops')}
            description={t('settings.sections.opsHint')}
          >
            <SearchableSelect
              className="sm:col-span-2"
              label={labelFor('timezone', t('settings.fields.timezone'))}
              name="timezone"
              value={stringVal('timezone')}
              options={timezoneOptions}
              onChange={(value) => setScalar('timezone', value)}
              placeholder={t('settings.timezone.select')}
              searchPlaceholder={t('settings.timezone.search')}
              emptyMessage={t('settings.timezone.empty')}
              hint={t('settings.hints.timezone')}
              badge={badgeFor('timezone')}
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
