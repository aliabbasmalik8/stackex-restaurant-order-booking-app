import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export function ProfileSubpage({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="flex h-full min-h-0 flex-col bg-page">
      <header className="flex shrink-0 items-center gap-4 bg-card px-4 py-4 shadow-[0_1px_0_var(--divider)] sm:px-9">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="grid size-[38px] place-items-center rounded-full bg-surface text-[17px] text-ink"
          aria-label={t('common.back')}
        >
          ‹
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-[17px] font-bold tracking-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-[12px] font-bold text-sub">{subtitle}</p>
          ) : null}
        </div>
      </header>
      <div className="mx-auto flex min-h-0 w-full max-w-[560px] flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-9">
        {children}
      </div>
      {footer ? (
        <div className="shrink-0 border-t border-divider bg-card px-4 py-4 sm:px-9">
          <div className="mx-auto w-full max-w-[560px]">{footer}</div>
        </div>
      ) : null}
    </div>
  )
}
