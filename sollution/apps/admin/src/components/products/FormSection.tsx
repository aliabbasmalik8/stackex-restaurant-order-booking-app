import type { ReactNode } from 'react'
import { Text } from '@/components/ui'

type FormSectionProps = {
  title: string
  description?: string
  children: ReactNode
}

/** Labeled block with a hairline separator for long admin forms. */
export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="mt-8 border-t border-divider pt-7 first:mt-0 first:border-t-0 first:pt-0">
      <div className="mb-5">
        <Text as="h2" variant="bodyStrong" className="m-0 tracking-tight">
          {title}
        </Text>
        {description ? (
          <Text variant="caption" className="mt-1 text-muted">
            {description}
          </Text>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}
