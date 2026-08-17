/**
 * Local theme-only brand knobs (palette).
 * Business name / monogram / dial / currency / VAT come from
 * `GET /api/settings/public` via `@/core/settings`.
 */
import type { PaletteId } from './palettes'

export const brand = {
  paletteId: 'midnight' as PaletteId,
} as const

export type Brand = typeof brand
