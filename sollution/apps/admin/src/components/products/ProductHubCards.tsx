import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ReadOnlyRow } from '@/components/settings/SettingFields'
import { Text } from '@/components/ui'
import type { MenuCategory, ProductInput } from '@/modules/products'
import { truncateText } from '@/modules/products/product.sections'

type HubProps = {
  productId: string
  slug: string
  form: ProductInput
  categories: MenuCategory[]
}

function SectionCard({
  title,
  body,
  to,
  children,
}: {
  title: string
  body: string
  to: string
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <article className="dash-panel group flex flex-col p-5 transition-[border-color,box-shadow] duration-150 hover:shadow-md md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Text as="h2" variant="bodyStrong" className="m-0 text-base tracking-tight">
            {title}
          </Text>
          <Text variant="caption" className="mt-1 max-w-md text-muted">
            {body}
          </Text>
        </div>
        <Link
          to={to}
          className="inline-flex h-9 shrink-0 items-center rounded-pill border border-border bg-card px-3.5 text-xs font-extrabold text-ink shadow-sm transition-[background-color,box-shadow,transform] duration-150 hover:bg-surface hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          {t('common.edit')}
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </article>
  )
}

export function ProductHubCards({
  productId,
  slug,
  form,
  categories,
}: HubProps) {
  const { t } = useTranslation()
  const base = `/products/${productId}`
  const categoryLabel =
    categories.find((c) => c.id === form.categoryId)?.label || '—'
  const optionCount = form.modifiers.reduce(
    (sum, g) => sum + g.options.length,
    0,
  )

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-divider bg-surface/40 px-4 py-4 md:px-5">
        <div className="min-w-0">
          <Text variant="label" className="m-0 text-muted">
            {t('products.form.name')}
          </Text>
          <Text variant="bodyStrong" className="mt-1 truncate text-base">
            {form.name || slug || productId}
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <div>
            <Text variant="caption" className="text-muted">
              {t('products.form.category')}
            </Text>
            <Text variant="bodyStrong" className="mt-0.5">
              {categoryLabel}
            </Text>
          </div>
          <div>
            <Text variant="caption" className="text-muted">
              {t('products.form.available')}
            </Text>
            <Text variant="bodyStrong" className="mt-0.5">
              {form.available
                ? t('products.available')
                : t('products.unavailable')}
            </Text>
          </div>
          <div>
            <Text variant="caption" className="text-muted">
              {t('products.form.modifiers')}
            </Text>
            <Text variant="bodyStrong" className="mt-0.5">
              {form.modifiers.length}
            </Text>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard
        title={t('products.sections.basics')}
        body={t('products.sections.basicsHint')}
        to={`${base}/basics`}
      >
        <ReadOnlyRow label={t('products.form.id')} value={slug || productId} />
        <ReadOnlyRow
          label={t('products.form.price')}
          value={String(form.price)}
        />
        <ReadOnlyRow label={t('products.form.name')} value={form.name || '—'} />
        <ReadOnlyRow
          label={t('products.form.nameAr')}
          value={form.name_arabic || '—'}
        />
        <ReadOnlyRow
          label={t('products.form.calories')}
          value={form.calories == null ? '—' : String(form.calories)}
        />
        </SectionCard>

        <SectionCard
        title={t('products.sections.catalog')}
        body={t('products.sections.catalogHint')}
        to={`${base}/catalog`}
      >
        <ReadOnlyRow label={t('products.form.category')} value={categoryLabel} />
        <ReadOnlyRow
          label={t('products.form.sortOrder')}
          value={String(form.sortOrder)}
        />
        <ReadOnlyRow
          label={t('products.form.available')}
          value={
            form.available
              ? t('products.available')
              : t('products.unavailable')
          }
        />
        <ReadOnlyRow
          label={t('products.form.featured')}
          value={form.featured ? t('common.yes') : t('common.no')}
        />
        </SectionCard>

        <SectionCard
        title={t('products.sections.media')}
        body={t('products.sections.mediaHint')}
        to={`${base}/media`}
      >
        <div className="sm:col-span-2">
          {form.image ? (
            <img
              src={form.image}
              alt=""
              className="mb-3 h-28 w-40 rounded-xl object-cover ring-1 ring-border"
            />
          ) : null}
          <ReadOnlyRow
            label={t('products.form.image')}
            value={truncateText(form.image, 60) || '—'}
          />
        </div>
        <ReadOnlyRow label={t('products.form.badge')} value={form.badge || '—'} />
        <ReadOnlyRow
          label={t('products.form.badgeAr')}
          value={form.badge_arabic || '—'}
        />
        </SectionCard>

        <SectionCard
        title={t('products.sections.copy')}
        body={t('products.sections.copyHint')}
        to={`${base}/copy`}
      >
        <ReadOnlyRow
          label={t('products.form.description')}
          value={truncateText(form.description) || '—'}
        />
        <ReadOnlyRow
          label={t('products.form.descriptionAr')}
          value={truncateText(form.description_arabic) || '—'}
        />
        {form.featured ? (
          <>
            <ReadOnlyRow
              label={t('products.form.featuredSubtitle')}
              value={form.featuredSubtitle || '—'}
            />
            <ReadOnlyRow
              label={t('products.form.featuredSubtitleAr')}
              value={form.featuredSubtitle_arabic || '—'}
            />
          </>
        ) : null}
        <ReadOnlyRow
          label={t('products.form.longDescription')}
          value={truncateText(form.longDescription) || '—'}
        />
        <ReadOnlyRow
          label={t('products.form.longDescriptionAr')}
          value={truncateText(form.longDescription_arabic) || '—'}
        />
        </SectionCard>

        <SectionCard
        title={t('products.form.modifiers')}
        body={t('products.form.modifiersHint')}
        to={`${base}/modifiers`}
      >
        <ReadOnlyRow
          label={t('products.hub.modifierGroups')}
          value={String(form.modifiers.length)}
        />
        <ReadOnlyRow
          label={t('products.hub.modifierOptions')}
          value={String(optionCount)}
        />
        {form.modifiers.length === 0 ? (
          <Text variant="caption" className="sm:col-span-2 text-muted">
            {t('products.form.noModifiers')}
          </Text>
        ) : null}
        </SectionCard>
      </div>
    </div>
  )
}
