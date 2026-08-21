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
        stateClassName="p-5 md:p-6"
        onRetry={() => void refresh()}
      >
        <div className="dash-panel overflow-x-auto">
          <table className="dash-table min-w-[720px]">
            <thead>
              <tr>
                <th className="text-start">{t('branches.columns.branch')}</th>
                <th className="text-start">{t('branches.columns.location')}</th>
                <th className="text-end">{t('branches.columns.eta')}</th>
                <th className="text-end">{t('branches.columns.sort')}</th>
                <th className="text-center">{t('branches.columns.status')}</th>
                <th className="text-center">{t('branches.columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr
                  key={branch.id}
                  className="transition-[background-color,box-shadow] duration-150 hover:bg-surface/55 focus-within:bg-surface/55"
                >
                  <td className="py-4 text-start">
                    <Text
                      as="span"
                      variant="bodyStrong"
                      className="m-0 block text-base tracking-tight"
                    >
                      {branch.name}
                    </Text>
                    <Text
                      as="span"
                      variant="caption"
                      className="mt-0.5 block text-muted"
                    >
                      {branch.slug}
                      {branch.name_arabic ? (
                        <span className="text-muted">
                          {' · '}
                          {branch.name_arabic}
                        </span>
                      ) : null}
                    </Text>
                  </td>
                  <td className="py-4 text-start text-sub">
                    {branch.lat != null && branch.lng != null ? (
                      <div>
                        <Text as="span" variant="body" className="m-0 block text-ink">
                          {t('branches.pin', {
                            lat: branch.lat,
                            longitude: branch.lng,
                          })}
                        </Text>
                        {branch.deliveryRadiusKm != null ? (
                          <Text as="span" variant="caption" className="mt-0.5 block text-muted">
                            {t('branches.radiusKm', {
                              count: branch.deliveryRadiusKm,
                            })}
                          </Text>
                        ) : null}
                      </div>
                    ) : (
                      <Text as="span" variant="caption" className="text-muted">
                        {t('branches.noPin')}
                      </Text>
                    )}
                  </td>
                  <td className="py-4 text-end font-bold tabular-nums text-sub">
                    {t('branches.etaMinutes', { count: branch.etaMinutes })}
                  </td>
                  <td className="py-4 text-end font-bold tabular-nums text-sub">{branch.sortOrder}</td>
                  <td className="py-4 text-center">
                    <span
                      className={[
                        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-bold ring-1 ring-inset transition-[background-color,border-color,color,box-shadow] duration-150',
                        branch.active
                          ? 'border-cta/25 bg-cta/15 text-ink ring-cta/20'
                          : 'border-border bg-surface text-muted ring-border',
                      ].join(' ')}
                    >
                      <span
                        aria-hidden="true"
                        className={[
                          'size-1.5 rounded-full',
                          branch.active ? 'bg-cta' : 'bg-muted',
                        ].join(' ')}
                      />
                      {branch.active
                        ? t('branches.active')
                        : t('branches.inactive')}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <Link
                      to={`/branches/${branch.id}`}
                      className="inline-flex h-8 items-center justify-center rounded-pill border border-border bg-card px-3 text-xs font-extrabold text-ink shadow-sm transition-[background-color,box-shadow,transform] duration-150 hover:bg-surface hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 active:scale-[0.98]"
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
