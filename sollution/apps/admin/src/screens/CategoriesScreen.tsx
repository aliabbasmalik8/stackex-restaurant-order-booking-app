import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { StateBlock } from '@/components/layout/StateBlock'
import { Button, Text } from '@/components/ui'
import { useCategories } from '@/modules/categories'

export function CategoriesScreen() {
  const { t } = useTranslation()
  const { categories, loading, error, deletingId, refresh, remove } =
    useCategories()
  const [flash, setFlash] = useState<string | null>(null)

  const onDelete = async (id: string, label: string) => {
    setFlash(null)
    const ok = window.confirm(t('categories.confirmDelete', { label }))
    if (!ok) return
    const result = await remove(id)
    if (!result.ok) {
      if (result.reason === 'PROTECTED') {
        setFlash(t('categories.errors.protected'))
      } else if (result.reason.startsWith('IN_USE')) {
        const count = result.reason.includes(':')
          ? result.reason.split(':')[1]
          : ''
        setFlash(
          count
            ? t('categories.errors.inUseCount', { count })
            : t('categories.errors.inUse'),
        )
      } else {
        setFlash(result.reason)
      }
    }
  }

  return (
    <section>
      <PageHeader
        eyebrow={t('nav.main')}
        title={t('categories.title')}
        subtitle={t('categories.subtitle')}
        action={
          <>
            <Button
              label={t('common.refresh')}
              variant="secondary"
              className="h-10 px-4 text-sm"
              onClick={() => void refresh()}
              disabled={loading}
            />
            <Link
              to="/categories/new"
              className="inline-flex h-10 items-center justify-center rounded-pill bg-cta px-4 text-sm font-extrabold text-on-primary shadow-cta transition hover:brightness-105"
            >
              {t('categories.add')}
            </Link>
          </>
        }
      />

      {flash ? (
        <Text variant="caption" className="mb-3 block text-error">
          {flash}
        </Text>
      ) : null}

      <StateBlock
        loading={loading}
        error={error}
        empty={categories.length === 0}
        emptyTitle={t('categories.emptyTitle')}
        emptyBody={t('categories.emptyBody')}
        onRetry={() => void refresh()}
      >
        <div className="dash-panel overflow-x-auto">
          <table className="dash-table min-w-[640px]">
            <thead>
              <tr>
                <th>{t('categories.columns.category')}</th>
                <th>{t('categories.columns.sort')}</th>
                <th>{t('categories.columns.products')}</th>
                <th>{t('categories.columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <Text as="span" variant="bodyStrong" className="m-0 block">
                      {cat.label}
                    </Text>
                    <Text as="span" variant="caption" className="text-muted">
                      {cat.slug}
                      {cat.label_arabic ? ` · ${cat.label_arabic}` : ''}
                      {cat.protected ? ` · ${t('categories.protected')}` : ''}
                    </Text>
                  </td>
                  <td className="text-sub">{cat.sortOrder}</td>
                  <td className="text-sub">{cat.productCount}</td>
                  <td>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/categories/${cat.id}`}
                        className="inline-flex rounded-pill bg-surface px-3 py-1.5 text-xs font-extrabold text-ink ring-1 ring-border transition hover:bg-card"
                      >
                        {t('common.edit')}
                      </Link>
                      <Button
                        type="button"
                        label={t('common.delete')}
                        variant="ghost"
                        className="h-8 px-3 text-xs text-error hover:bg-error/10"
                        disabled={
                          cat.protected ||
                          cat.productCount > 0 ||
                          deletingId === cat.id
                        }
                        loading={deletingId === cat.id}
                        title={
                          cat.protected
                            ? t('categories.errors.protected')
                            : cat.productCount > 0
                              ? t('categories.errors.inUseCount', {
                                  count: cat.productCount,
                                })
                              : t('common.delete')
                        }
                        onClick={() => void onDelete(cat.id, cat.label)}
                      />
                    </div>
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
