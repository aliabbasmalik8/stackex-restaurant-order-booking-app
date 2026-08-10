import { useTranslation } from 'react-i18next'
import { Field, Text } from '@/components/ui'
import {
  CheckboxField,
  SelectField,
  TextAreaField,
} from '@/components/ui/FormControls'
import { FormSection } from '@/components/products/FormSection'
import { ModifiersEditor } from '@/components/products/ModifiersEditor'
import {
  slugifyProductId,
  type Branch,
  type MenuCategory,
  type ProductInput,
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
      {/* 1 — Identity & pricing */}
      <FormSection
        title={t('products.sections.basics')}
        description={t('products.sections.basicsHint')}
      >
        {isNew ? (
          <Field
            label={t('products.form.id')}
            name="id"
            value={productId}
            placeholder={slugifyProductId(form.name) || 'chicken-shawarma'}
            onChange={(e) => onProductIdChange(e.target.value)}
          />
        ) : (
          <div>
            <Text variant="label" className="mb-1.5 ps-1.5">
              {t('products.form.id')}
            </Text>
            <Text variant="bodyStrong" className="font-mono text-sm">
              {productId}
            </Text>
          </div>
        )}
        <Field
          label={t('products.form.price')}
          type="number"
          min={0}
          step="0.01"
          value={form.price}
          onChange={(e) => onPatch('price', Number(e.target.value) || 0)}
        />
        <Field
          label={t('products.form.name')}
          value={form.name}
          onChange={(e) => {
            onPatch('name', e.target.value)
            if (isNew) onProductIdChange(slugifyProductId(e.target.value))
          }}
        />
        <Field
          label={t('products.form.nameAr')}
          value={form.name_arabic}
          onChange={(e) => onPatch('name_arabic', e.target.value)}
        />
        <Field
          label={t('products.form.calories')}
          type="number"
          min={0}
          value={form.calories ?? ''}
          onChange={(e) =>
            onPatch(
              'calories',
              e.target.value === '' ? null : Number(e.target.value) || 0,
            )
          }
        />
      </FormSection>

      {/* 2 — Placement on menu */}
      <FormSection
        title={t('products.sections.catalog')}
        description={t('products.sections.catalogHint')}
      >
        <SelectField
          label={t('products.form.category')}
          value={form.categoryId}
          onChange={(e) => onPatch('categoryId', e.target.value)}
          options={[
            { value: '', label: t('products.form.selectCategory') },
            ...categories.map((c) => ({ value: c.id, label: c.label })),
          ]}
        />
        <SelectField
          label={t('products.form.branch')}
          value={form.branchId}
          onChange={(e) => onPatch('branchId', e.target.value)}
          options={[
            { value: '', label: t('products.form.selectBranch') },
            ...branches.map((b) => ({ value: b.id, label: b.name })),
          ]}
        />
        <Field
          label={t('products.form.sortOrder')}
          type="number"
          value={form.sortOrder}
          onChange={(e) => onPatch('sortOrder', Number(e.target.value) || 0)}
        />
        <div className="flex flex-wrap items-end gap-6 pb-2 sm:col-span-1">
          <CheckboxField
            label={t('products.form.available')}
            checked={form.available}
            onChange={(e) => onPatch('available', e.target.checked)}
          />
          <CheckboxField
            label={t('products.form.featured')}
            checked={form.featured}
            onChange={(e) => onPatch('featured', e.target.checked)}
          />
        </div>
      </FormSection>

      {/* 3 — Media & badges */}
      <FormSection
        title={t('products.sections.media')}
        description={t('products.sections.mediaHint')}
      >
        <div className="sm:col-span-2">
          <Field
            label={t('products.form.image')}
            value={form.image}
            onChange={(e) => onPatch('image', e.target.value)}
            placeholder="https://…"
          />
        </div>
        {form.image ? (
          <div className="sm:col-span-2">
            <img
              src={form.image}
              alt=""
              className="h-28 w-40 rounded-xl object-cover ring-1 ring-border"
            />
          </div>
        ) : null}
        <Field
          label={t('products.form.badge')}
          value={form.badge}
          onChange={(e) => onPatch('badge', e.target.value)}
        />
        <Field
          label={t('products.form.badgeAr')}
          value={form.badge_arabic}
          onChange={(e) => onPatch('badge_arabic', e.target.value)}
        />
      </FormSection>

      {/* 4 — Descriptions */}
      <FormSection
        title={t('products.sections.copy')}
        description={t('products.sections.copyHint')}
      >
        <TextAreaField
          label={t('products.form.description')}
          value={form.description}
          onChange={(e) => onPatch('description', e.target.value)}
          rows={2}
        />
        <TextAreaField
          label={t('products.form.descriptionAr')}
          value={form.description_arabic}
          onChange={(e) => onPatch('description_arabic', e.target.value)}
          rows={2}
        />
        <Field
          label={t('products.form.featuredSubtitle')}
          value={form.featuredSubtitle}
          onChange={(e) => onPatch('featuredSubtitle', e.target.value)}
        />
        <Field
          label={t('products.form.featuredSubtitleAr')}
          value={form.featuredSubtitle_arabic}
          onChange={(e) => onPatch('featuredSubtitle_arabic', e.target.value)}
        />
        <TextAreaField
          label={t('products.form.longDescription')}
          value={form.longDescription}
          onChange={(e) => onPatch('longDescription', e.target.value)}
          rows={3}
        />
        <TextAreaField
          label={t('products.form.longDescriptionAr')}
          value={form.longDescription_arabic}
          onChange={(e) => onPatch('longDescription_arabic', e.target.value)}
          rows={3}
        />
      </FormSection>

      {/* 5 — Modifiers */}
      <section className="mt-8 border-t border-divider pt-7">
        <ModifiersEditor
          value={form.modifiers}
          onChange={(modifiers) => onChange({ ...form, modifiers })}
        />
      </section>
    </div>
  )
}
