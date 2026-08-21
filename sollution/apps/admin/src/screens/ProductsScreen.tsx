import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { StateBlock } from '@/components/layout/StateBlock'
import { Button, Text } from '@/components/ui'
import { useProducts } from '@/modules/products'

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 2,
  }).format(value)
}

export function ProductsScreen() {
  const { t } = useTranslation()
  const {
    products,
    filtered,
    categories,
    loading,
    error,
    search,
    setSearch,
    categoryId,
    setCategoryId,
    refresh,
  } = useProducts()

  const categoryLabel = (id: string) =>
    categories.find((c) => c.id === id)?.label ?? id

  return (
    <section>
      <PageHeader
        eyebrow={t('nav.main')}
        title={t('products.title')}
        subtitle={t('products.subtitle')}
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
              to="/products/new"
              className="inline-flex h-10 items-center justify-center rounded-pill bg-cta px-4 text-sm font-extrabold text-on-primary shadow-cta transition hover:brightness-105"
            >
              {t('products.add')}
            </Link>
          </>
        }
      />

      <div className="dash-toolbar mb-5">
        <div className="flex w-full flex-wrap items-center gap-2">
          <label className="block min-w-0 flex-1 sm:max-w-xs">
            <span className="sr-only">{t('products.search')}</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('products.searchPlaceholder')}
              className="dash-input"
            />
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="dash-input w-auto min-w-[10rem]"
            aria-label={t('products.filterCategory')}
          >
            <option value="all">{t('products.allCategories')}</option>
            {categories
              .filter((c) => c.slug !== 'all')
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
          </select>
        </div>
      </div>

      <StateBlock
        loading={loading}
        error={error}
        empty={filtered.length === 0}
        emptyTitle={
          products.length === 0
            ? t('products.emptyTitle')
            : t('products.noMatchesTitle', {
                defaultValue: 'No products match the current filters',
              })
        }
        emptyBody={
          products.length === 0
            ? t('products.emptyBody')
            : t('products.noMatchesBody', {
                defaultValue: 'Try adjusting your search or category filter.',
              })
        }
        onRetry={() => void refresh()}
      >
        <div className="dash-panel overflow-x-auto">
          <table className="dash-table min-w-[800px]">
            <thead>
              <tr>
                <th className="text-start">{t('products.columns.product')}</th>
                <th className="text-start">{t('products.columns.category')}</th>
                <th className="text-end">{t('products.columns.price')}</th>
                <th className="text-center">{t('products.columns.status')}</th>
                <th className="text-end">{t('products.columns.sort')}</th>
                <th className="text-end">{t('products.columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr
                  key={product.id}
                  className="group transition-[background-color,box-shadow] duration-200 hover:bg-surface/55 hover:shadow-[inset_3px_0_0_var(--cta-bg)] focus-within:bg-surface/55 focus-within:shadow-[inset_3px_0_0_var(--cta-bg)]"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3.5">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt=""
                          className="size-12 rounded-xl object-cover ring-1 ring-border transition-[box-shadow,transform] duration-200 group-hover:scale-[1.03] group-hover:shadow-sm"
                        />
                      ) : (
                        <div className="size-12 rounded-xl bg-surface ring-1 ring-border transition-[box-shadow,transform] duration-200 group-hover:scale-[1.03] group-hover:shadow-sm" />
                      )}
                      <div className="min-w-0">
                        <Text
                          as="span"
                          variant="bodyStrong"
                          className="m-0 block truncate text-[16px] font-extrabold tracking-tight"
                        >
                          {product.name}
                        </Text>
                        <Text
                          as="span"
                          variant="caption"
                          className="mt-0.5 block truncate text-muted"
                        >
                          {product.slug}
                          {product.featured ? (
                            <span className="ml-1.5 inline-flex items-center rounded-pill bg-cta/15 px-1.5 py-0.5 align-middle text-[10px] font-extrabold leading-none text-ink ring-1 ring-inset ring-cta/20">
                              {t('products.featured')}
                            </span>
                          ) : null}
                        </Text>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-start text-sub">{categoryLabel(product.categoryId)}</td>
                  <td className="py-4 text-end font-extrabold tracking-tight">
                    {formatMoney(product.price)}
                  </td>
                  <td className="py-4 text-center">
                    <span
                      className={[
                        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-bold ring-1 ring-inset transition-[background-color,border-color,color,box-shadow] duration-150',
                        product.available
                          ? 'border-cta/25 bg-cta/15 text-ink ring-cta/20'
                          : 'border-border bg-surface text-muted ring-border',
                      ].join(' ')}
                    >
                      <span
                        aria-hidden="true"
                        className={[
                          'size-1.5 rounded-full',
                          product.available ? 'bg-cta' : 'bg-muted',
                        ].join(' ')}
                      />
                      {product.available
                        ? t('products.available')
                        : t('products.unavailable')}
                    </span>
                  </td>
                  <td className="py-4 text-end text-sub">{product.sortOrder}</td>
                  <td className="py-4 text-end">
                    <Link
                      to={`/products/${product.id}`}
                      className="inline-flex h-8 items-center justify-center rounded-pill border border-border bg-card px-3 text-xs font-extrabold text-ink shadow-sm transition-[background-color,border-color,box-shadow,transform] duration-150 hover:bg-surface hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 active:scale-[0.98]"
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
