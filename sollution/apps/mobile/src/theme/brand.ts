/**
 * Local theme-only brand knobs (palette).
 * Business name / monogram / dial / currency / VAT come from
 * `GET /api/settings/public` via `@/core/settings` (catalog defaults + cache).
 */
import type { PaletteId } from './palettes';

export const brand = {
  /** Active design palette id — swap to re-theme every screen */
  paletteId: 'midnight' as PaletteId,
} as const;

export type Brand = typeof brand;
