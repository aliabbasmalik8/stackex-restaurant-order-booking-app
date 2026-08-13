import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ReadOnlyRow } from '@/components/settings/SettingFields'
import { Text } from '@/components/ui'
import type { BranchInput } from '@/modules/branches'
import { truncateText } from '@/modules/branches/branch.sections'

type HubProps = {
  branchId: string
  slug: string
  form: BranchInput
}

function SectionCard({
  title,
  body,
  to,
  children,
}: {
  title: string
  body: string
  to: string
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <article className="dash-panel flex flex-col p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Text as="h2" variant="bodyStrong" className="m-0 tracking-tight">
            {title}
          </Text>
          <Text variant="caption" className="mt-1 text-muted">
            {body}
          </Text>
        </div>
        <Link
          to={to}
          className="inline-flex h-10 items-center rounded-pill border border-border bg-card px-4 text-sm font-bold text-ink shadow-sm transition hover:bg-surface"
        >
          {t('common.edit')}
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </article>
  )
}

export function BranchHubCards({ branchId, slug, form }: HubProps) {
  const { t } = useTranslation()
  const base = `/branches/${branchId}`
  const radius =
    form.deliveryRadiusKm != null
      ? t('branches.radiusKm', { count: form.deliveryRadiusKm })
      : '—'

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <SectionCard
        title={t('branches.sections.basics')}
        body={t('branches.sections.basicsHint')}
        to={`${base}/basics`}
      >
        <ReadOnlyRow label={t('branches.form.slug')} value={slug || branchId} />
        <ReadOnlyRow label={t('branches.form.name')} value={form.name || '—'} />
        <ReadOnlyRow
          label={t('branches.form.nameAr')}
          value={form.name_arabic || '—'}
        />
        <ReadOnlyRow
          label={t('branches.form.sortOrder')}
          value={String(form.sortOrder)}
        />
        <ReadOnlyRow
          label={t('branches.form.active')}
          value={form.active ? t('branches.active') : t('branches.inactive')}
        />
      </SectionCard>

      <SectionCard
        title={t('branches.sections.address')}
        body={t('branches.sections.addressHint')}
        to={`${base}/address`}
      >
        <ReadOnlyRow
          label={t('branches.form.address')}
          value={truncateText(form.address) || '—'}
        />
        <ReadOnlyRow
          label={t('branches.form.addressAr')}
          value={truncateText(form.address_arabic) || '—'}
        />
      </SectionCard>

      <SectionCard
        title={t('branches.sections.location')}
        body={t('branches.sections.locationHint')}
        to={`${base}/location`}
      >
        <ReadOnlyRow
          label={t('branches.form.lat')}
          value={form.lat != null ? String(form.lat) : t('branches.noPin')}
        />
        <ReadOnlyRow
          label={t('branches.form.lng')}
          value={form.lng != null ? String(form.lng) : t('branches.noPin')}
        />
        <ReadOnlyRow
          label={t('branches.form.deliveryRadiusKm')}
          value={radius}
        />
        <ReadOnlyRow
          label={t('branches.form.etaMinutes')}
          value={t('branches.etaMinutes', { count: form.etaMinutes })}
        />
      </SectionCard>
    </div>
  )
}
