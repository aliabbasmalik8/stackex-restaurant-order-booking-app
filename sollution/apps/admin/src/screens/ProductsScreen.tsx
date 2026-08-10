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
        title={t('products.title')}
        subtitle={t('products.subtitle')}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              label={t('common.refresh')}
              variant="secondary"
              className="h-10 px-4 text-sm"
              onClick={() => void refresh()}
              disabled={loading}
            />
            <Link
              to="/products/new"
              className="inline-flex h-10 items-center justify-center rounded-pill bg-cta px-4 text-sm font-extrabold text-on-primary shadow-cta"
            >
              {t('products.add')}
            </Link>
          </div>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="block w-full sm:max-w-xs">
          <span className="sr-only">{t('products.search')}</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('products.searchPlaceholder')}
            className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-ink placeholder:text-muted outline-none focus:border-cta focus:ring-2 focus:ring-cta/20"
          />
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm font-bold text-ink outline-none focus:border-cta"
          aria-label={t('products.filterCategory')}
        >
          <option value="all">{t('products.allCategories')}</option>
          {categories
            .filter((c) => c.id !== 'all')
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
        </select>
      </div>

      <StateBlock
        loading={loading}
        error={error}
        empty={filtered.length === 0}
        emptyTitle={t('products.emptyTitle')}
        emptyBody={t('products.emptyBody')}
        onRetry={() => void refresh()}
      >
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-divider text-sub">
                <th className="px-4 py-3 font-extrabold uppercase tracking-[0.04em]">
                  {t('products.columns.product')}
                </th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-[0.04em]">
                  {t('products.columns.category')}
                </th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-[0.04em]">
                  {t('products.columns.price')}
                </th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-[0.04em]">
                  {t('products.columns.status')}
                </th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-[0.04em]">
                  {t('products.columns.sort')}
                </th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-[0.04em]">
                  {t('products.columns.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-divider last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt=""
                          className="size-12 rounded-md object-cover bg-surface"
                        />
                      ) : (
                        <div className="size-12 rounded-md bg-surface" />
                      )}
                      <div className="min-w-0">
                        <Text as="span" variant="bodyStrong" className="m-0 block truncate">
                          {product.name}
                        </Text>
                        <Text as="span" variant="caption" className="text-muted">
                          {product.id}
                          {product.featured ? ` · ${t('products.featured')}` : ''}
                        </Text>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sub">
                    {categoryLabel(product.categoryId)}
                  </td>
                  <td className="px-4 py-3 font-bold">
                    {formatMoney(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        'inline-flex rounded-pill px-2.5 py-1 text-xs font-bold',
                        product.available
                          ? 'bg-cta/15 text-ink'
                          : 'bg-surface text-muted',
                      ].join(' ')}
                    >
                      {product.available
                        ? t('products.available')
                        : t('products.unavailable')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sub">{product.sortOrder}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/products/${product.id}`}
                      className="text-sm font-bold text-link hover:underline"
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
