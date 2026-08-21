import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ReadOnlyRow } from '@/components/settings/SettingFields'
import { NoticeModal, Text } from '@/components/ui'
import { isPublicPreviewMode } from '@/lib/previewMode'
import type { BranchInput } from '@/modules/branches'
import { truncateText } from '@/modules/branches/branch.sections'

type HubProps = {
  branchId: string
  slug: string
  form: BranchInput
}

const editClassName =
  'inline-flex h-9 shrink-0 items-center rounded-pill border border-border bg-card px-3.5 text-xs font-extrabold text-ink shadow-sm transition-[background-color,box-shadow,transform] duration-150 hover:bg-surface hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 active:scale-[0.98]'

function SectionCard({
  title,
  body,
  to,
  onEditClick,
  children,
}: {
  title: string
  body: string
  to: string
  onEditClick?: () => void
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <article className="dash-panel group flex flex-col p-5 transition-shadow duration-150 hover:shadow-md md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Text as="h2" variant="bodyStrong" className="m-0 text-base tracking-tight">
            {title}
          </Text>
          <Text variant="caption" className="mt-1 max-w-md text-muted">
            {body}
          </Text>
        </div>
        {onEditClick ? (
          <button type="button" className={editClassName} onClick={onEditClick}>
            {t('common.edit')}
          </button>
        ) : (
          <Link to={to} className={editClassName}>
            {t('common.edit')}
          </Link>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </article>
  )
}

export function BranchHubCards({ branchId, slug, form }: HubProps) {
  const { t } = useTranslation()
  const previewMode = isPublicPreviewMode()
  const [locationPreviewOpen, setLocationPreviewOpen] = useState(false)
  const base = `/branches/${branchId}`
  const radius =
    form.deliveryRadiusKm != null
      ? t('branches.radiusKm', { count: form.deliveryRadiusKm })
      : '—'

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-divider bg-surface/40 px-4 py-4 md:px-5">
        <div className="min-w-0">
          <Text variant="label" className="m-0 text-muted">
            {t('branches.form.name')}
          </Text>
          <Text variant="bodyStrong" className="mt-1 truncate text-base">
            {form.name || slug || branchId}
          </Text>
          <Text variant="caption" className="mt-0.5 block truncate text-muted">
            {slug || branchId}
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <div className="max-w-xs">
            <Text variant="caption" className="text-muted">
              {t('branches.form.address')}
            </Text>
            <Text variant="bodyStrong" className="mt-0.5 truncate">
              {form.address || t('branches.noPin')}
            </Text>
          </div>
          <div>
            <Text variant="caption" className="text-muted">
              {t('branches.form.active')}
            </Text>
            <Text variant="bodyStrong" className="mt-0.5">
              {form.active ? t('branches.active') : t('branches.inactive')}
            </Text>
          </div>
        </div>
      </div>

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
        onEditClick={
          previewMode ? () => setLocationPreviewOpen(true) : undefined
        }
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

      <NoticeModal
        open={locationPreviewOpen}
        title={t('branches.form.locationEditPreviewTitle')}
        body={t('branches.form.locationEditPreviewBody')}
        confirmLabel={t('common.close')}
        onClose={() => setLocationPreviewOpen(false)}
      />
      </div>
    </div>
  )
}
