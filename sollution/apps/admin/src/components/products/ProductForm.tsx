import { useTranslation } from 'react-i18next'
import { FormSection } from '@/components/products/FormSection'
import { ModifiersEditor } from '@/components/products/ModifiersEditor'
import {
  ProductBasicsFields,
  ProductCatalogFields,
  ProductCopyFields,
  ProductMediaFields,
} from '@/components/products/ProductSectionFields'
import type {
  Branch,
  MenuCategory,
  ProductInput,
} from '@/modules/products'

type ProductFormProps = {
  form: ProductInput
  productId: string
  isNew: boolean
  categories: MenuCategory[]
  branches: Branch[]
  onProductIdChange: (id: string) => void
  onPatch: <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => void
  onChange: (next: ProductInput) => void
}

export function ProductForm({
  form,
  productId,
  isNew,
  categories,
  branches,
  onProductIdChange,
  onPatch,
  onChange,
}: ProductFormProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-0">
      <FormSection
        title={t('products.sections.basics')}
        description={t('products.sections.basicsHint')}
      >
        <ProductBasicsFields
          form={form}
          productId={productId}
          isNew={isNew}
          onProductIdChange={onProductIdChange}
          onPatch={onPatch}
        />
      </FormSection>

      <FormSection
        title={t('products.sections.catalog')}
        description={t('products.sections.catalogHint')}
      >
        <ProductCatalogFields
          form={form}
          categories={categories}
          branches={branches}
          onPatch={onPatch}
          onChange={onChange}
        />
      </FormSection>

      <FormSection
        title={t('products.sections.media')}
        description={t('products.sections.mediaHint')}
      >
        <ProductMediaFields form={form} onPatch={onPatch} />
      </FormSection>

      <FormSection
        title={t('products.sections.copy')}
        description={t('products.sections.copyHint')}
      >
        <ProductCopyFields form={form} onPatch={onPatch} />
      </FormSection>

      <section className="mt-8 border-t border-divider pt-7">
        <ModifiersEditor
          value={form.modifiers}
          onChange={(modifiers) => onChange({ ...form, modifiers })}
        />
      </section>
    </div>
  )
}
