import type { ReactNode } from 'react'
import { Text } from '@/components/ui'

type PageHeaderProps = {
  title: string
  subtitle?: string
  action?: ReactNode
  eyebrow?: string
}

export function PageHeader({
  title,
  subtitle,
  action,
  eyebrow,
}: PageHeaderProps) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-divider/80 pb-5">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted">
            {eyebrow}
          </p>
        ) : null}
        <Text
          as="h1"
          variant="title"
          className="m-0 text-[1.75rem] tracking-tight md:text-[1.9rem]"
        >
          {title}
        </Text>
        {subtitle ? (
          <Text variant="subtitle" className="mt-1.5 max-w-xl text-sub">
            {subtitle}
          </Text>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  )
}
