import { useTranslation } from 'react-i18next'
import { Field, Text } from '@/components/ui'
import {
  CheckboxField,
  SelectField,
  TextAreaField,
} from '@/components/ui/FormControls'
import { ProductImageField } from '@/components/products/ProductImageField'
import {
  slugifyProductId,
  type Branch,
  type MenuCategory,
  type ProductInput,
} from '@/modules/products'

type Patch = <K extends keyof ProductInput>(
  key: K,
  value: ProductInput[K],
) => void

type BasicsProps = {
  form: ProductInput
  productId: string
  isNew: boolean
  onProductIdChange: (id: string) => void
  onPatch: Patch
}

export function ProductBasicsFields({
  form,
  productId,
  isNew,
  onProductIdChange,
  onPatch,
}: BasicsProps) {
  const { t } = useTranslation()

  return (
    <>
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
    </>
  )
}

type CatalogProps = {
  form: ProductInput
  categories: MenuCategory[]
  branches: Branch[]
  onPatch: Patch
  onChange: (next: ProductInput) => void
}

export function ProductCatalogFields({
  form,
  categories,
  branches,
  onPatch,
  onChange,
}: CatalogProps) {
  const { t } = useTranslation()

  return (
    <>
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
          onChange={(e) => {
            const featured = e.target.checked
            if (featured) {
              onPatch('featured', true)
              return
            }
            onChange({
              ...form,
              featured: false,
              featuredSubtitle: '',
              featuredSubtitle_arabic: '',
            })
          }}
        />
      </div>
    </>
  )
}

type MediaProps = {
  form: ProductInput
  onPatch: Patch
}

export function ProductMediaFields({ form, onPatch }: MediaProps) {
  const { t } = useTranslation()

  return (
    <>
      <ProductImageField
        imageUrl={form.image}
        onUrlChange={(url) => onPatch('image', url)}
      />
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
    </>
  )
}

type CopyProps = {
  form: ProductInput
  onPatch: Patch
}

export function ProductCopyFields({ form, onPatch }: CopyProps) {
  const { t } = useTranslation()

  return (
    <>
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
      {form.featured ? (
        <>
          <Field
            label={t('products.form.featuredSubtitle')}
            value={form.featuredSubtitle}
            onChange={(e) => onPatch('featuredSubtitle', e.target.value)}
          />
          <Field
            label={t('products.form.featuredSubtitleAr')}
            value={form.featuredSubtitle_arabic}
            onChange={(e) =>
              onPatch('featuredSubtitle_arabic', e.target.value)
            }
          />
        </>
      ) : null}
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
    </>
  )
}
