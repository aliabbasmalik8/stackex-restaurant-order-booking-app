import { useState, type InputHTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui'

type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  label: string
  error?: string | null
}

export function PasswordField({
  label,
  error,
  id,
  className = '',
  disabled,
  autoComplete = 'current-password',
  ...inputProps
}: PasswordFieldProps) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const fieldId = id ?? inputProps.name

  return (
    <label className="flex flex-col gap-1.5" htmlFor={fieldId}>
      <Text as="span" variant="label" className="ps-1.5">
        {label}
      </Text>
      <div className="flex h-[58px] items-center rounded-[16px] border-[1.5px] border-border bg-card px-[18px] focus-within:border-cta focus-within:ring-2 focus-within:ring-cta/15">
        <input
          id={fieldId}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          disabled={disabled}
          className={[
            'h-full min-w-0 flex-1 bg-transparent text-[15px] font-bold text-ink outline-none placeholder:font-semibold placeholder:text-muted',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          disabled={disabled}
          className="shrink-0 px-1 text-xs font-extrabold text-muted"
        >
          {visible ? t('auth.hidePassword') : t('auth.showPassword')}
        </button>
      </div>
      {error ? (
        <Text as="span" variant="caption" className="ps-1.5 text-error">
          {error}
        </Text>
      ) : null}
    </label>
  )
}
