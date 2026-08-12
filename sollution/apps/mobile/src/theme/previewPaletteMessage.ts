import { isPaletteId } from './colors';
import type { PaletteId } from './palettes';

/** Parent iframe chrome → web preview. Keep in sync with `.docs/preview-mode.md`. */
export const PREVIEW_PALETTE_SOURCE = 'preview-host';
export const PREVIEW_PALETTE_TYPE = 'setPalette';

export type PreviewPaletteMessage = {
  source: typeof PREVIEW_PALETTE_SOURCE;
  type: typeof PREVIEW_PALETTE_TYPE;
  paletteId: PaletteId;
};

export function parsePreviewPaletteMessage(data: unknown): PaletteId | null {
  if (!data || typeof data !== 'object') return null;
  const msg = data as Record<string, unknown>;
  if (msg.source !== PREVIEW_PALETTE_SOURCE) return null;
  if (msg.type !== PREVIEW_PALETTE_TYPE) return null;
  return isPaletteId(msg.paletteId) ? msg.paletteId : null;
}
