import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProductForm } from '@/components/products/ProductForm'
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
    setProductId,
    isNew,
    categories,
    branches,
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

  return (
    <section>
      <PageHeader
        title={isNew ? t('products.createTitle') : t('products.editTitle')}
        subtitle={isNew ? t('products.createSubtitle') : form.name || productId}
        action={
          <Link
            to="/products"
            className="inline-flex h-10 items-center rounded-pill border border-border bg-surface px-4 text-sm font-bold text-ink"
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
        className="rounded-xl border border-border bg-card p-5 shadow-card md:p-8"
      >
        <ProductForm
          form={form}
          productId={productId}
          isNew={isNew}
          categories={categories}
          branches={branches}
          onProductIdChange={setProductId}
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
