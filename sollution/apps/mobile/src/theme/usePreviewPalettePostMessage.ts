import type { PaletteId } from './palettes';

/** Native: iframe postMessage does not apply. */
export function usePreviewPalettePostMessage(
  _setPaletteId: (id: PaletteId) => void,
): void {}
