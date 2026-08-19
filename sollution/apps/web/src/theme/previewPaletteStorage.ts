import { isPreviewMode } from '@/lib/previewMode'
import { PALETTE_IDS, type PaletteId } from './palettes'

export const PREVIEW_PALETTE_STORAGE_KEY = 'preview_palette_id'

function asPaletteId(value: string | null): PaletteId | null {
  if (value && (PALETTE_IDS as string[]).includes(value)) {
    return value as PaletteId
  }
  return null
}

export function loadPreviewPalette(): PaletteId | null {
  if (!isPreviewMode()) return null
  try {
    return asPaletteId(localStorage.getItem(PREVIEW_PALETTE_STORAGE_KEY))
  } catch {
    return null
  }
}

export function persistPreviewPalette(paletteId: PaletteId): void {
  if (!isPreviewMode()) return
  try {
    localStorage.setItem(PREVIEW_PALETTE_STORAGE_KEY, paletteId)
  } catch {
    // ignore — preview override stays in memory for this session
  }
}
