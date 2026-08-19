import { useSyncExternalStore } from 'react'
import {
  applyPalette,
  getActivePaletteId,
  subscribePalette,
} from './applyTheme'
import { persistPreviewPalette } from './previewPaletteStorage'
import type { PaletteId } from './palettes'

export type ThemeValue = {
  paletteId: PaletteId
  setPaletteId: (id: PaletteId) => void
}

export function setPaletteId(id: PaletteId): void {
  applyPalette(id)
  persistPreviewPalette(id)
}

export function useTheme(): ThemeValue {
  const paletteId = useSyncExternalStore(
    subscribePalette,
    getActivePaletteId,
    getActivePaletteId,
  )
  return { paletteId, setPaletteId }
}
