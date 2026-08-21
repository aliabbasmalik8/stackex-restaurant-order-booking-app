import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { FormSection } from '@/components/products/FormSection'
import { Button, Field, Text } from '@/components/ui'
import {
  PROTECTED_CATEGORY_SLUGS,
  slugifyCategoryId,
  useCategoryEditor,
} from '@/modules/categories'

export function CategoryEditScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { categoryId: idParam = 'new' } = useParams<{ categoryId: string }>()
  const {
    form,
    slug,
    setSlug,
    isNew,
    loading,
    saving,
    error,
    save,
    patch,
  } = useCategoryEditor(idParam)
  const [saveSuccess, setSaveSuccess] = useState(
    Boolean((location.state as { saved?: boolean } | null)?.saved),
  )

  const isProtected = !isNew && PROTECTED_CATEGORY_SLUGS.has(slug)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaveSuccess(false)
    const saved = await save()
    if (saved) {
      if (isNew) {
        navigate(`/categories/${saved.id}`, {
          replace: true,
          state: { saved: true },
        })
      } else {
        setSaveSuccess(true)
      }
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
        eyebrow={t('nav.categories')}
        title={
          isNew ? t('categories.createTitle') : t('categories.editTitle')
        }
        subtitle={
          isNew
            ? t('categories.createSubtitle')
            : form.label || slug
        }
        action={
          <Link
            to="/categories"
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
      {saveSuccess ? (
        <div
          role="status"
          className="mb-4 flex items-center gap-2 rounded-xl border border-cta/25 bg-cta/10 px-3.5 py-3 text-ink"
        >
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-cta"
          />
          <Text variant="caption" className="m-0 text-ink">
            {t('categories.saved', {
              defaultValue: 'Category saved successfully.',
            })}
          </Text>
        </div>
      ) : null}

      {isProtected ? (
        <Text variant="caption" className="mb-4 block text-sub">
          {t('categories.protectedHint')}
        </Text>
      ) : null}

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="dash-panel p-5 md:p-8"
      >
        <FormSection
          title={t('categories.sections.details')}
          description={t('categories.sections.detailsHint')}
        >
          {isNew ? (
            <Field
              label={t('categories.form.id')}
              name="id"
              value={slug}
              placeholder={slugifyCategoryId(form.label) || 'shawarma'}
              onChange={(e) => setSlug(e.target.value)}
            />
          ) : (
            <div>
              <Text variant="label" className="mb-1.5 ps-1.5">
                {t('categories.form.id')}
              </Text>
              <Text variant="bodyStrong" className="font-mono text-sm">
                {slug}
              </Text>
            </div>
          )}
          <Field
            label={t('categories.form.sortOrder')}
            type="number"
            value={form.sortOrder}
            onChange={(e) => patch('sortOrder', Number(e.target.value) || 0)}
            disabled={isProtected}
          />
          <Field
            label={t('categories.form.label')}
            value={form.label}
            onChange={(e) => {
              patch('label', e.target.value)
              if (isNew) setSlug(slugifyCategoryId(e.target.value))
            }}
            disabled={isProtected}
          />
          <Field
            label={t('categories.form.labelAr')}
            value={form.label_arabic}
            onChange={(e) => patch('label_arabic', e.target.value)}
            disabled={isProtected}
          />
        </FormSection>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-divider pt-6">
          <Button
            type="submit"
            label={t('common.save')}
            loading={saving}
            disabled={isProtected}
            className="min-w-32"
          />
          <Button
            type="button"
            label={t('common.cancel')}
            variant="secondary"
            onClick={() => navigate('/categories')}
          />
        </div>
      </form>
    </section>
  )
}
