import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { FormSection } from '@/components/products/FormSection'
import {
  BranchAddressFields,
  BranchBasicsFields,
  BranchLocationFields,
} from '@/components/branches/BranchSectionFields'
import { Button, Text } from '@/components/ui'
import { useBranchEditor } from '@/modules/branches'
import {
  isBranchSection,
  type BranchSection,
} from '@/modules/branches/branch.sections'

function sectionTitleKey(section: BranchSection): string {
  return `branches.sections.${section}`
}

function sectionHintKey(section: BranchSection): string {
  return `branches.sections.${section}Hint`
}

export function BranchSectionEditScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { branchId: idParam = '', section: sectionParam = '' } = useParams<{
    branchId: string
    section: string
  }>()

  const sectionValid = isBranchSection(sectionParam)
  const {
    form,
    slug,
    branchId,
    loading,
    saving,
    error,
    save,
    patch,
  } = useBranchEditor(idParam)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const saved = await save()
    if (saved) {
      navigate(`/branches/${saved.id}`, { replace: true })
    }
  }

  if (!idParam || !sectionValid) {
    return (
      <Navigate to={idParam ? `/branches/${idParam}` : '/branches'} replace />
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

  const backTo = `/branches/${branchId || idParam}`

  return (
    <section>
      <PageHeader
        eyebrow={form.name || slug || branchId}
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
              form="branch-section-form"
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
        id="branch-section-form"
        onSubmit={(e) => void onSubmit(e)}
        className="dash-panel p-5 md:p-8"
      >
        {section === 'basics' ? (
          <FormSection
            title={t('branches.sections.basics')}
            description={t('branches.sections.basicsHint')}
          >
            <BranchBasicsFields form={form} slug={slug} onPatch={patch} />
          </FormSection>
        ) : null}

        {section === 'address' ? (
          <FormSection
            title={t('branches.sections.address')}
            description={t('branches.sections.addressHint')}
          >
            <BranchAddressFields form={form} onPatch={patch} />
          </FormSection>
        ) : null}

        {section === 'location' ? (
          <FormSection
            title={t('branches.sections.location')}
            description={t('branches.sections.locationHint')}
          >
            <BranchLocationFields form={form} onPatch={patch} />
          </FormSection>
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
