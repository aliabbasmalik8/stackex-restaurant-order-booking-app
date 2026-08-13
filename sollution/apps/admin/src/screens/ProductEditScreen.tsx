import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProductForm } from '@/components/products/ProductForm'
import { ProductHubCards } from '@/components/products/ProductHubCards'
import { Button, Text } from '@/components/ui'
import { useProductEditor } from '@/modules/products'

export function ProductEditScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { productId: idParam = 'new' } = useParams<{ productId: string }>()
  const {
    form,
    setForm,
    productId,
    slug,
    setSlug,
    isNew,
    categories,
    loading,
    saving,
    error,
    save,
    patch,
  } = useProductEditor(idParam)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const saved = await save()
    if (saved && isNew) {
      navigate(`/products/${saved.id}`, { replace: true })
    }
  }

  if (loading) {
    return (
      <Text variant="subtitle" className="py-12 text-center text-sub">
        {t('common.loading')}
      </Text>
    )
  }

  if (!isNew && error && !productId) {
    return (
      <section>
        <PageHeader
          eyebrow={t('nav.products')}
          title={t('products.editTitle')}
          action={
            <Link
              to="/products"
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

  if (!isNew) {
    return (
      <section>
        <PageHeader
          eyebrow={t('nav.products')}
          title={form.name || slug || productId}
          subtitle={t('products.hub.subtitle')}
          action={
            <Link
              to="/products"
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
        <ProductHubCards
          productId={productId}
          slug={slug}
          form={form}
          categories={categories}
        />
      </section>
    )
  }

  return (
    <section>
      <PageHeader
        eyebrow={t('nav.products')}
        title={t('products.createTitle')}
        subtitle={t('products.createSubtitle')}
        action={
          <Link
            to="/products"
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

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="dash-panel p-5 md:p-8"
      >
        <ProductForm
          form={form}
          productId={slug}
          isNew
          categories={categories}
          onProductIdChange={setSlug}
          onPatch={patch}
          onChange={setForm}
        />

        <div className="mt-8 flex flex-wrap gap-3 border-t border-divider pt-6">
          <Button
            type="submit"
            label={t('common.save')}
            loading={saving}
            className="min-w-32"
          />
          <Button
            type="button"
            label={t('common.cancel')}
            variant="secondary"
            onClick={() => navigate('/products')}
          />
        </div>
      </form>
    </section>
  )
}
