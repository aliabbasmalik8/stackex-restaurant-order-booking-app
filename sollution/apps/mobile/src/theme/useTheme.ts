import { useSyncExternalStore } from 'react';
import {
  applyPalette,
  getActivePaletteId,
  getColors,
  subscribePalette,
  type Colors,
} from './colors';
import { persistPreviewPalette } from './previewPaletteStorage';
import type { PaletteId } from './palettes';

export type ThemeValue = {
  paletteId: PaletteId;
  colors: Colors;
  setPaletteId: (id: PaletteId) => void;
};

export function setPaletteId(id: PaletteId): void {
  applyPalette(id);
  void persistPreviewPalette(id);
}

export function useTheme(): ThemeValue {
  const paletteId = useSyncExternalStore(
    subscribePalette,
    getActivePaletteId,
    getActivePaletteId,
  );
  return {
    paletteId,
    colors: getColors(),
    setPaletteId,
  };
}

/** Subscribe to palette changes and return a `createStyles` sheet. */
export function useThemedStyles<T>(sheet: T): T {
  useTheme();
  return sheet;
}
