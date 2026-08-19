/**
 * White-label brand config — change these to re-skin the entire admin.
 *
 * Palette options (shared with mobile):
 *   charcoal | red | dark | emerald | saffron | midnight | olive
 */
import type { PaletteId } from './palettes'

export const brand = {
  /** Active design palette id — swap to re-theme every screen */
  paletteId: 'midnight' as PaletteId,

  /** Client-facing name shown in chrome / welcome */
  name: 'DineOS',

  /** Letter mark used in logo tile */
  monogram: 'D',

  /** Product label for this admin surface */
  product: 'Admin',
} as const

export type Brand = typeof brand
