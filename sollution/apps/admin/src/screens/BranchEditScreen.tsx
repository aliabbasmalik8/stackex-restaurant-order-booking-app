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
              className="inline-flex h-10 items-center rounded-pill border border-border bg-card px-4 text-sm font-bold text-ink shadow-sm transition hover:bg-surface"
            >
              {t('common.back')}
            </Link>
          }
        />
        <Text variant="caption" className="text-error">
          {error}
        </Text>
      </section>
    )
  }

  return (
    <section>
      <PageHeader
        eyebrow={t('nav.branches')}
        title={form.name || slug || branchId}
        subtitle={t('branches.hub.subtitle')}
        action={
          <Link
            to="/branches"
            className="inline-flex h-10 items-center rounded-pill border border-border bg-card px-4 text-sm font-bold text-ink shadow-sm transition hover:bg-surface"
          >
            {t('common.back')}
          </Link>
        }
      />
      {error ? (
        <Text variant="caption" className="mb-4 text-error">
          {error}
        </Text>
      ) : null}
      <BranchHubCards
        branchId={branchId || idParam}
        slug={slug}
        form={form}
      />
    </section>
  )
}
