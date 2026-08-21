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
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-xl border border-error/25 bg-error/10 px-3.5 py-3 text-error"
        >
          <span
            aria-hidden="true"
            className="mt-0.5 size-1.5 shrink-0 rounded-full bg-error"
          />
          <Text variant="caption" className="m-0 text-error">
            {flash}
          </Text>
        </div>
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
                <th className="text-start">{t('categories.columns.category')}</th>
                <th className="text-end">{t('categories.columns.sort')}</th>
                <th className="text-end">{t('categories.columns.products')}</th>
                <th className="text-center">{t('categories.columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="transition-[background-color,box-shadow] duration-150 hover:bg-surface/55 focus-within:bg-surface/55"
                >
                  <td className="py-4 text-start">
                    <Text
                      as="span"
                      variant="bodyStrong"
                      className="m-0 block text-base tracking-tight"
                    >
                      {cat.label}
                    </Text>
                    <Text
                      as="span"
                      variant="caption"
                      className="mt-0.5 block text-muted"
                    >
                      {cat.slug}
                      {cat.label_arabic ? (
                        <span className="text-muted">{' · '}{cat.label_arabic}</span>
                      ) : null}
                      {cat.protected ? (
                        <span className="ml-1.5 inline-flex items-center rounded-pill bg-surface px-1.5 py-0.5 align-middle text-[10px] font-extrabold leading-none text-sub ring-1 ring-inset ring-border">
                          {t('categories.protected')}
                        </span>
                      ) : null}
                    </Text>
                  </td>
                  <td className="py-4 text-end font-bold tabular-nums text-sub">{cat.sortOrder}</td>
                  <td className="py-4 text-end font-bold tabular-nums text-sub">{cat.productCount}</td>
                  <td className="py-4 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <Link
                        to={`/categories/${cat.id}`}
                        className="inline-flex h-8 items-center justify-center rounded-pill border border-border bg-card px-3 text-xs font-extrabold text-ink shadow-sm transition-[background-color,box-shadow,transform] duration-150 hover:bg-surface hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 active:scale-[0.98]"
                      >
                        {t('common.edit')}
                      </Link>
                      <Button
                        type="button"
                        label={t('common.delete')}
                        variant="ghost"
                        className="h-8 px-3 text-xs text-error transition-[background-color,box-shadow,transform] duration-150 hover:bg-error/10 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent disabled:hover:shadow-none"
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
