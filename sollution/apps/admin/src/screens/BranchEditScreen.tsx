import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { FormSection } from '@/components/products/FormSection'
import { Button, Field, Text } from '@/components/ui'
import { CheckboxField } from '@/components/ui/FormControls'
import { useBranchEditor } from '@/modules/branches'

export function BranchEditScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { branchId: idParam = '' } = useParams<{ branchId: string }>()
  const { form, slug, loading, saving, error, save, patch } =
    useBranchEditor(idParam)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await save()
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
        eyebrow={t('nav.branches')}
        title={t('branches.editTitle')}
        subtitle={form.name || slug}
        action={
          <Link
            to="/branches"
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
        <FormSection
          title={t('branches.sections.details')}
          description={t('branches.sections.detailsHint')}
        >
          <div>
            <Text variant="label" className="mb-1.5 ps-1.5">
              {t('branches.form.slug')}
            </Text>
            <Text variant="bodyStrong" className="font-mono text-sm">
              {slug}
            </Text>
          </div>
          <Field
            label={t('branches.form.name')}
            value={form.name}
            onChange={(e) => patch('name', e.target.value)}
          />
          <Field
            label={t('branches.form.nameAr')}
            value={form.name_arabic}
            onChange={(e) => patch('name_arabic', e.target.value)}
          />
          <Field
            label={t('branches.form.address')}
            value={form.address}
            onChange={(e) => patch('address', e.target.value)}
          />
          <Field
            label={t('branches.form.addressAr')}
            value={form.address_arabic}
            onChange={(e) => patch('address_arabic', e.target.value)}
          />
          <Field
            label={t('branches.form.etaMinutes')}
            type="number"
            value={form.etaMinutes}
            onChange={(e) =>
              patch('etaMinutes', Number(e.target.value) || 0)
            }
          />
          <Field
            label={t('branches.form.sortOrder')}
            type="number"
            value={form.sortOrder}
            onChange={(e) =>
              patch('sortOrder', Number(e.target.value) || 0)
            }
          />
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <CheckboxField
              label={t('branches.form.active')}
              name="active"
              checked={form.active}
              disabled
              readOnly
            />
            <Text as="span" variant="caption" className="ps-1.5 text-muted">
              {t('branches.form.activeLocked')}
            </Text>
          </div>
        </FormSection>

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
            onClick={() => navigate('/branches')}
          />
        </div>
      </form>
    </section>
  )
}
