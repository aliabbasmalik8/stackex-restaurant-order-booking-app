import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { FormSection } from '@/components/products/FormSection'
import { ModifiersEditor } from '@/components/products/ModifiersEditor'
import {
  ProductBasicsFields,
  ProductCatalogFields,
  ProductCopyFields,
  ProductMediaFields,
} from '@/components/products/ProductSectionFields'
import { Button, Text } from '@/components/ui'
import { useProductEditor } from '@/modules/products'
import {
  isProductSection,
  type ProductSection,
} from '@/modules/products/product.sections'

function sectionTitleKey(section: ProductSection): string {
  if (section === 'modifiers') return 'products.form.modifiers'
  return `products.sections.${section}`
}

function sectionHintKey(section: ProductSection): string {
  if (section === 'modifiers') return 'products.form.modifiersHint'
  return `products.sections.${section}Hint`
}

export function ProductSectionEditScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { productId: idParam = '', section: sectionParam = '' } = useParams<{
    productId: string
    section: string
  }>()

  const sectionValid = isProductSection(sectionParam)
  const editorId = idParam === 'new' || !idParam ? 'new' : idParam
  const {
    form,
    setForm,
    productId,
    slug,
    categories,
    loading,
    saving,
    error,
    save,
    patch,
  } = useProductEditor(editorId)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const saved = await save()
    if (saved) {
      navigate(`/products/${saved.id}`, { replace: true })
    }
  }

  if (idParam === 'new' || !sectionValid) {
    return (
      <Navigate to={idParam ? `/products/${idParam}` : '/products'} replace />
    )
  }

  const section = sectionParam

  if (loading) {
    return (
      <Text variant="subtitle" className="py-12 text-center text-sub">
        {t('common.loading')}
      </Text>
    )
  }

  const backTo = `/products/${productId || idParam}`

  return (
    <section>
      <PageHeader
        eyebrow={form.name || slug || productId}
        title={t(sectionTitleKey(section))}
        subtitle={t(sectionHintKey(section))}
        action={
          <>
            <Link
              to={backTo}
              className="inline-flex h-10 items-center rounded-pill border border-border bg-card px-4 text-sm font-bold text-ink shadow-sm transition hover:bg-surface"
            >
              {t('common.back')}
            </Link>
            <Button
              type="submit"
              form="product-section-form"
              label={t('common.save')}
              className="h-10 px-4 text-sm"
              loading={saving}
            />
          </>
        }
      />

      {error ? (
        <Text variant="caption" className="mb-4 text-error">
          {error}
        </Text>
      ) : null}

      <form
        id="product-section-form"
        onSubmit={(e) => void onSubmit(e)}
        className="dash-panel p-5 md:p-8"
      >
        {section === 'basics' ? (
          <FormSection
            title={t('products.sections.basics')}
            description={t('products.sections.basicsHint')}
          >
            <ProductBasicsFields
              form={form}
              productId={slug || productId}
              isNew={false}
              onProductIdChange={() => undefined}
              onPatch={patch}
            />
          </FormSection>
        ) : null}

        {section === 'catalog' ? (
          <FormSection
            title={t('products.sections.catalog')}
            description={t('products.sections.catalogHint')}
          >
            <ProductCatalogFields
              form={form}
              categories={categories}
              onPatch={patch}
              onChange={setForm}
            />
          </FormSection>
        ) : null}

        {section === 'media' ? (
          <FormSection
            title={t('products.sections.media')}
            description={t('products.sections.mediaHint')}
          >
            <ProductMediaFields form={form} onPatch={patch} />
          </FormSection>
        ) : null}

        {section === 'copy' ? (
          <FormSection
            title={t('products.sections.copy')}
            description={t('products.sections.copyHint')}
          >
            <ProductCopyFields form={form} onPatch={patch} />
          </FormSection>
        ) : null}

        {section === 'modifiers' ? (
          <ModifiersEditor
            value={form.modifiers}
            onChange={(modifiers) => setForm({ ...form, modifiers })}
          />
        ) : null}

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
            onClick={() => navigate(backTo)}
          />
        </div>
      </form>
    </section>
  )
}
