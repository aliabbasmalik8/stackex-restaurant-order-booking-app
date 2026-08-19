import { useTranslation } from 'react-i18next'
import {
  PALETTE_GROUPS,
  palettes,
  useTheme,
  type PaletteId,
} from '@/theme'
import { Text } from './Text'

const PALETTE_LABEL_KEYS: Record<PaletteId, string> = {
  charcoal: 'preview.palettes.charcoal',
  red: 'preview.palettes.red',
  dark: 'preview.palettes.dark',
  emerald: 'preview.palettes.emerald',
  saffron: 'preview.palettes.saffron',
  midnight: 'preview.palettes.midnight',
  olive: 'preview.palettes.olive',
}

const GROUP_LABEL_KEYS: Record<(typeof PALETTE_GROUPS)[number]['id'], string> = {
  warm: 'preview.paletteGroups.warm',
  cool: 'preview.paletteGroups.cool',
  earth: 'preview.paletteGroups.earth',
  darkUi: 'preview.paletteGroups.darkUi',
}

export function PreviewThemeModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { paletteId, setPaletteId } = useTheme()

  if (!open) return null

  const select = (id: PaletteId) => {
    setPaletteId(id)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(560px,90vh)] w-full max-w-sm flex-col rounded-[22px] bg-card p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="theme-title"
      >
        <Text as="h2" variant="title" id="theme-title" className="mb-1">
          {t('preview.themeTitle')}
        </Text>
        <Text variant="subtitle" className="mb-5 text-sub">
          {t('preview.themeSubtitle')}
        </Text>
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {PALETTE_GROUPS.map((group, groupIndex) => (
            <div key={group.id}>
              <p
                className={[
                  'pb-1 text-[11px] font-extrabold tracking-[0.08em] text-muted uppercase',
                  groupIndex > 0 ? 'mt-4 border-t border-divider pt-3.5' : '',
                ].join(' ')}
              >
                {t(GROUP_LABEL_KEYS[group.id])}
              </p>
              <div className="flex flex-col gap-2">
                {group.ids.map((id) => {
                  const active = id === paletteId
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => select(id)}
                      className={[
                        'flex items-center gap-3 rounded-[18px] border-[1.5px] px-4 py-3.5 text-start',
                        active
                          ? 'border-cta bg-card'
                          : 'border-transparent bg-surface hover:bg-divider',
                      ].join(' ')}
                    >
                      <span
                        className="size-7 shrink-0 rounded-full"
                        style={{ backgroundColor: palettes[id].ctaBg }}
                      />
                      <span className="flex-1 text-[15px] font-extrabold">
                        {t(PALETTE_LABEL_KEYS[id])}
                      </span>
                      <span
                        className={[
                          'grid size-[22px] place-items-center rounded-full border-[1.5px]',
                          active ? 'border-cta' : 'border-border',
                        ].join(' ')}
                        aria-hidden
                      >
                        {active ? (
                          <span className="size-3 rounded-full bg-cta" />
                        ) : null}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 h-[52px] shrink-0 rounded-full bg-cta text-[15px] font-extrabold text-on-primary"
        >
          {t('languages.done')}
        </button>
      </div>
    </div>
  )
}
