import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { BranchHubCards } from '@/components/branches/BranchHubCards'
import { Text } from '@/components/ui'
import { useBranchEditor } from '@/modules/branches'

export function BranchEditScreen() {
  const { t } = useTranslation()
  const { branchId: idParam = '' } = useParams<{ branchId: string }>()
  const { form, slug, branchId, loading, error } = useBranchEditor(idParam)

  if (loading) {
    return (
      <Text variant="subtitle" className="py-12 text-center text-sub">
        {t('common.loading')}
      </Text>
    )
  }

  if (error && !branchId) {
    return (
      <section>
        <PageHeader
          eyebrow={t('nav.branches')}
          title={t('branches.editTitle')}
          action={
            <Link
              to="/branches"
              aria-label={`${t('common.back')} ${t('nav.branches')}`}
              className="inline-flex h-10 items-center rounded-pill border border-border bg-card px-4 text-sm font-bold text-ink shadow-sm transition-[background-color,box-shadow,transform] duration-150 hover:bg-surface hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              {t('common.back')}
            </Link>
          }
        />
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-error/25 bg-error/10 px-3.5 py-3 text-error">
          <span aria-hidden="true" className="mt-0.5 size-1.5 shrink-0 rounded-full bg-error" />
          <Text variant="caption" className="m-0 text-error">
            {error}
          </Text>
        </div>
      </section>
    )
  }

  return (
    <section>
      <PageHeader
        eyebrow={t('nav.branches')}
        title={form.name || slug || branchId}
          subtitle={
            form.address
              ? `${t('branches.hub.subtitle')} · ${form.address}`
              : t('branches.hub.subtitle')
          }
        action={
          <Link
            to="/branches"
            aria-label={`${t('common.back')} ${t('nav.branches')}`}
            className="inline-flex h-10 items-center rounded-pill border border-border bg-card px-4 text-sm font-bold text-ink shadow-sm transition-[background-color,box-shadow,transform] duration-150 hover:bg-surface hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            {t('common.back')}
          </Link>
        }
      />
      {error ? (
        <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-error/25 bg-error/10 px-3.5 py-3 text-error">
          <span aria-hidden="true" className="mt-0.5 size-1.5 shrink-0 rounded-full bg-error" />
          <Text variant="caption" className="m-0 text-error">
            {error}
          </Text>
        </div>
      ) : null}
      <BranchHubCards
        branchId={branchId || idParam}
        slug={slug}
        form={form}
      />
    </section>
  )
}
