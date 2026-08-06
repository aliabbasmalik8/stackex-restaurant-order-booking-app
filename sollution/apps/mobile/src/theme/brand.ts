/**
 * White-label brand config — change these to re-skin the entire app.
 *
 * Palette options (from design Tweaks):
 *   charcoal | red | dark | emerald | saffron | midnight | olive
 *
 * Default matches the design doc: midnight + Sanam Grill.
 */
import type { PaletteId } from './palettes';

export const brand = {
  /** Active design palette id — swap to re-theme every screen */
  paletteId: 'midnight' as PaletteId,

  /** Client-facing name shown in copy / splash later */
  name: 'Sanam Grill',

  /** Letter mark used in logo tile + hero watermark */
  monogram: 'S',

  /** Default dialing locale for phone auth */
  dialCode: '+971',
  dialFlag: '🇦🇪',
  dialRegion: 'AE',
} as const;

export type Brand = typeof brand;
