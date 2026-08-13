import { useTranslation } from 'react-i18next'
import { Field, Text } from '@/components/ui'
import { CheckboxField } from '@/components/ui/FormControls'
import {
  parseOptionalNumber,
  type BranchInput,
} from '@/modules/branches'

type Patch = <K extends keyof BranchInput>(
  key: K,
  value: BranchInput[K],
) => void

type BasicsProps = {
  form: BranchInput
  slug: string
  onPatch: Patch
}

export function BranchBasicsFields({ form, slug, onPatch }: BasicsProps) {
  const { t } = useTranslation()

  return (
    <>
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
        onChange={(e) => onPatch('name', e.target.value)}
      />
      <Field
        label={t('branches.form.nameAr')}
        value={form.name_arabic}
        onChange={(e) => onPatch('name_arabic', e.target.value)}
      />
      <Field
        label={t('branches.form.sortOrder')}
        type="number"
        value={form.sortOrder}
        onChange={(e) => onPatch('sortOrder', Number(e.target.value) || 0)}
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
    </>
  )
}

type AddressProps = {
  form: BranchInput
  onPatch: Patch
}

export function BranchAddressFields({ form, onPatch }: AddressProps) {
  const { t } = useTranslation()

  return (
    <>
      <Field
        label={t('branches.form.address')}
        value={form.address}
        onChange={(e) => onPatch('address', e.target.value)}
      />
      <Field
        label={t('branches.form.addressAr')}
        value={form.address_arabic}
        onChange={(e) => onPatch('address_arabic', e.target.value)}
      />
    </>
  )
}

type LocationProps = {
  form: BranchInput
  onPatch: Patch
}

export function BranchLocationFields({ form, onPatch }: LocationProps) {
  const { t } = useTranslation()

  return (
    <>
      <Field
        label={t('branches.form.lat')}
        type="number"
        step="0.000001"
        value={form.lat ?? ''}
        onChange={(e) => onPatch('lat', parseOptionalNumber(e.target.value))}
      />
      <Field
        label={t('branches.form.lng')}
        type="number"
        step="0.000001"
        value={form.lng ?? ''}
        onChange={(e) => onPatch('lng', parseOptionalNumber(e.target.value))}
      />
      <Field
        label={t('branches.form.deliveryRadiusKm')}
        type="number"
        step="0.1"
        min={0}
        value={form.deliveryRadiusKm ?? ''}
        onChange={(e) =>
          onPatch('deliveryRadiusKm', parseOptionalNumber(e.target.value))
        }
      />
      <Text variant="caption" className="sm:col-span-2 text-muted">
        {t('branches.form.deliveryRadiusHint')}
      </Text>
      <Field
        label={t('branches.form.etaMinutes')}
        type="number"
        value={form.etaMinutes}
        onChange={(e) => onPatch('etaMinutes', Number(e.target.value) || 0)}
      />
    </>
  )
}
