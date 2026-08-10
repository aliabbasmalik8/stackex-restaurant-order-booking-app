import { BrandMark, Button, Text } from '@/components/ui'
import { brand } from '@/theme'

export function WelcomeScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-6">
      <section className="w-full max-w-md rounded-xl bg-card p-8 shadow-card">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-lg bg-hero">
            <BrandMark size={40} />
          </div>
          <div>
            <Text variant="label" className="mb-1">
              {brand.product}
            </Text>
            <Text as="h1" variant="title" className="m-0">
              {brand.name}
            </Text>
          </div>
        </div>

        <Text variant="display" className="mb-3">
          Welcome
        </Text>
        <Text variant="subtitle" className="mb-8 text-sub">
          Admin scaffold is ready. Theme tokens follow the mobile app — change{' '}
          <code className="rounded-sm bg-surface px-1.5 py-0.5 text-xs text-ink">
            brand.paletteId
          </code>{' '}
          to re-skin.
        </Text>

        <Button label="Get started" className="w-full" />
      </section>
    </main>
  )
}
