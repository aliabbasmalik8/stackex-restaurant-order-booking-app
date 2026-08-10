import { useTranslation } from 'react-i18next'
import { Button, Field, Text } from '@/components/ui'
import { CheckboxField, SelectField } from '@/components/ui/FormControls'
import {
  emptyModifierChoice,
  emptyModifierGroup,
  type ModifierGroup,
} from '@/modules/products'

type ModifiersEditorProps = {
  value: ModifierGroup[]
  onChange: (next: ModifierGroup[]) => void
}

export function ModifiersEditor({ value, onChange }: ModifiersEditorProps) {
  const { t } = useTranslation()

  const updateGroup = (index: number, next: ModifierGroup) => {
    onChange(value.map((g, i) => (i === index ? next : g)))
  }

  const removeGroup = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const addGroup = () => {
    onChange([...value, emptyModifierGroup()])
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Text as="h2" variant="bodyStrong" className="m-0">
            {t('products.form.modifiers')}
          </Text>
          <Text variant="caption" className="text-muted">
            {t('products.form.modifiersHint')}
          </Text>
        </div>
        <Button
          type="button"
          label={t('products.form.addGroup')}
          variant="secondary"
          className="h-9 px-3 text-xs"
          onClick={addGroup}
        />
      </div>

      {value.length === 0 ? (
        <Text variant="subtitle" className="text-sub">
          {t('products.form.noModifiers')}
        </Text>
      ) : null}

      {value.map((group, gi) => (
        <div
          key={`group-${gi}`}
          className="rounded-xl border border-border bg-surface/40 p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <Text variant="label" className="m-0">
              {t('products.form.group')} {gi + 1}
            </Text>
            <Button
              type="button"
              label={t('common.remove')}
              variant="ghost"
              className="h-8 px-2 text-xs text-error"
              onClick={() => removeGroup(gi)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label={t('products.form.modifierId')}
              value={group.id}
              onChange={(e) =>
                updateGroup(gi, { ...group, id: e.target.value })
              }
            />
            <SelectField
              label={t('products.form.modifierType')}
              value={group.type}
              onChange={(e) =>
                updateGroup(gi, {
                  ...group,
                  type: e.target.value === 'multi' ? 'multi' : 'single',
                })
              }
              options={[
                { value: 'single', label: t('products.form.typeSingle') },
                { value: 'multi', label: t('products.form.typeMulti') },
              ]}
            />
            <Field
              label={t('products.form.modifierLabel')}
              value={group.label}
              onChange={(e) =>
                updateGroup(gi, { ...group, label: e.target.value })
              }
            />
            <Field
              label={t('products.form.modifierLabelAr')}
              value={group.label_arabic}
              onChange={(e) =>
                updateGroup(gi, { ...group, label_arabic: e.target.value })
              }
            />
          </div>

          <div className="mt-3">
            <CheckboxField
              label={t('products.form.required')}
              checked={group.required}
              onChange={(e) =>
                updateGroup(gi, { ...group, required: e.target.checked })
              }
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Text variant="label" className="m-0">
              {t('products.form.options')}
            </Text>
            <Button
              type="button"
              label={t('products.form.addOption')}
              variant="secondary"
              className="h-8 px-3 text-xs"
              onClick={() =>
                updateGroup(gi, {
                  ...group,
                  options: [...group.options, emptyModifierChoice()],
                })
              }
            />
          </div>

          <div className="mt-2 flex flex-col gap-3">
            {group.options.map((opt, oi) => (
              <div
                key={`opt-${gi}-${oi}`}
                className="grid gap-2 rounded-lg border border-divider bg-card p-3 sm:grid-cols-2"
              >
                <Field
                  label={t('products.form.optionId')}
                  value={opt.id}
                  onChange={(e) => {
                    const options = group.options.map((o, i) =>
                      i === oi ? { ...o, id: e.target.value } : o,
                    )
                    updateGroup(gi, { ...group, options })
                  }}
                />
                <Field
                  label={t('products.form.optionPrice')}
                  type="number"
                  min={0}
                  step="0.01"
                  value={opt.price}
                  onChange={(e) => {
                    const options = group.options.map((o, i) =>
                      i === oi
                        ? { ...o, price: Number(e.target.value) || 0 }
                        : o,
                    )
                    updateGroup(gi, { ...group, options })
                  }}
                />
                <Field
                  label={t('products.form.optionLabel')}
                  value={opt.label}
                  onChange={(e) => {
                    const options = group.options.map((o, i) =>
                      i === oi ? { ...o, label: e.target.value } : o,
                    )
                    updateGroup(gi, { ...group, options })
                  }}
                />
                <Field
                  label={t('products.form.optionLabelAr')}
                  value={opt.label_arabic}
                  onChange={(e) => {
                    const options = group.options.map((o, i) =>
                      i === oi ? { ...o, label_arabic: e.target.value } : o,
                    )
                    updateGroup(gi, { ...group, options })
                  }}
                />
                <Field
                  label={t('products.form.optionHint')}
                  value={opt.hint ?? ''}
                  onChange={(e) => {
                    const options = group.options.map((o, i) =>
                      i === oi ? { ...o, hint: e.target.value } : o,
                    )
                    updateGroup(gi, { ...group, options })
                  }}
                />
                <div className="flex items-end">
                  <Button
                    type="button"
                    label={t('common.remove')}
                    variant="ghost"
                    className="h-10 px-3 text-xs text-error"
                    onClick={() => {
                      updateGroup(gi, {
                        ...group,
                        options: group.options.filter((_, i) => i !== oi),
                      })
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
