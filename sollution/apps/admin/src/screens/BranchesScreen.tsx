import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { StateBlock } from '@/components/layout/StateBlock'
import { Button, Text } from '@/components/ui'
import { useBranchesList } from '@/modules/branches'

export function BranchesScreen() {
  const { t } = useTranslation()
  const { branches, loading, error, refresh } = useBranchesList()

  return (
    <section>
      <PageHeader
        eyebrow={t('nav.main')}
        title={t('branches.title')}
        subtitle={t('branches.subtitle')}
        action={
          <Button
            label={t('common.refresh')}
            variant="secondary"
            className="h-10 px-4 text-sm"
            onClick={() => void refresh()}
            disabled={loading}
          />
        }
      />

      <StateBlock
        loading={loading}
        error={error}
        empty={branches.length === 0}
        emptyTitle={t('branches.emptyTitle')}
        emptyBody={t('branches.emptyBody')}
        onRetry={() => void refresh()}
      >
        <div className="dash-panel overflow-x-auto">
          <table className="dash-table min-w-[720px]">
            <thead>
              <tr>
                <th>{t('branches.columns.branch')}</th>
                <th>{t('branches.columns.location')}</th>
                <th>{t('branches.columns.eta')}</th>
                <th>{t('branches.columns.sort')}</th>
                <th>{t('branches.columns.status')}</th>
                <th>{t('branches.columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr key={branch.id}>
                  <td>
                    <Text as="span" variant="bodyStrong" className="m-0 block">
                      {branch.name}
                    </Text>
                    <Text as="span" variant="caption" className="text-muted">
                      {branch.slug}
                      {branch.name_arabic ? ` · ${branch.name_arabic}` : ''}
                    </Text>
                  </td>
                  <td className="text-sub">
                    {branch.lat != null && branch.lng != null
                      ? [
                          t('branches.pin', {
                            lat: branch.lat,
                            longitude: branch.lng,
                          }),
                          branch.deliveryRadiusKm != null
                            ? t('branches.radiusKm', {
                                count: branch.deliveryRadiusKm,
                              })
                            : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')
                      : t('branches.noPin')}
                  </td>
                  <td className="text-sub">
                    {t('branches.etaMinutes', { count: branch.etaMinutes })}
                  </td>
                  <td className="text-sub">{branch.sortOrder}</td>
                  <td className="text-sub">
                    {branch.active
                      ? t('branches.active')
                      : t('branches.inactive')}
                  </td>
                  <td>
                    <Link
                      to={`/branches/${branch.id}`}
                      className="inline-flex rounded-pill bg-surface px-3 py-1.5 text-xs font-extrabold text-ink ring-1 ring-border transition hover:bg-card"
                    >
                      {t('common.edit')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StateBlock>
    </section>
  )
}
