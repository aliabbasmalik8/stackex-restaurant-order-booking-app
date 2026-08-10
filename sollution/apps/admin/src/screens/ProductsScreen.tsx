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
        <label className="block w-full sm:max-w-xs">
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
        <div className="dash-panel overflow-x-auto">
          <table className="dash-table min-w-[800px]">
            <thead>
              <tr>
                <th>{t('products.columns.product')}</th>
                <th>{t('products.columns.category')}</th>
                <th>{t('products.columns.price')}</th>
                <th>{t('products.columns.status')}</th>
                <th>{t('products.columns.sort')}</th>
                <th>{t('products.columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt=""
                          className="size-12 rounded-xl object-cover ring-1 ring-border"
                        />
                      ) : (
                        <div className="size-12 rounded-xl bg-surface ring-1 ring-border" />
                      )}
                      <div className="min-w-0">
                        <Text
                          as="span"
                          variant="bodyStrong"
                          className="m-0 block truncate tracking-tight"
                        >
                          {product.name}
                        </Text>
                        <Text as="span" variant="caption" className="text-muted">
                          {product.id}
                          {product.featured
                            ? ` · ${t('products.featured')}`
                            : ''}
                        </Text>
                      </div>
                    </div>
                  </td>
                  <td className="text-sub">{categoryLabel(product.categoryId)}</td>
                  <td className="font-extrabold tracking-tight">
                    {formatMoney(product.price)}
                  </td>
                  <td>
                    <span
                      className={[
                        'inline-flex rounded-pill px-2.5 py-1 text-xs font-bold ring-1 ring-inset ring-black/5',
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
                  <td className="text-sub">{product.sortOrder}</td>
                  <td>
                    <Link
                      to={`/products/${product.id}`}
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
