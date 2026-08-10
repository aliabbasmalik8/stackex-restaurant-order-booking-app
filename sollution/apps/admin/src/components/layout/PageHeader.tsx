import type { ReactNode } from 'react'
import { Text } from '@/components/ui'

type PageHeaderProps = {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <Text as="h1" variant="title" className="m-0">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="subtitle" className="mt-1 text-sub">
            {subtitle}
          </Text>
        ) : null}
      </div>
      {action}
    </div>
  )
}
