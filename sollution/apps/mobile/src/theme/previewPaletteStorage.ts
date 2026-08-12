import AsyncStorage from '@react-native-async-storage/async-storage';
import { isPreviewMode } from '@/lib/previewMode';
import { PALETTE_IDS, type PaletteId } from './palettes';

/** AsyncStorage key (web backend is localStorage). */
export const PREVIEW_PALETTE_STORAGE_KEY = 'preview_palette_id';

function asPaletteId(value: string | null): PaletteId | null {
  if (value && (PALETTE_IDS as string[]).includes(value)) {
    return value as PaletteId;
  }
  return null;
}

export async function loadPreviewPalette(): Promise<PaletteId | null> {
  if (!isPreviewMode()) return null;
  try {
    const raw = await AsyncStorage.getItem(PREVIEW_PALETTE_STORAGE_KEY);
    return asPaletteId(raw);
  } catch {
    return null;
  }
}

export async function persistPreviewPalette(paletteId: PaletteId): Promise<void> {
  if (!isPreviewMode()) return;
  try {
    await AsyncStorage.setItem(PREVIEW_PALETTE_STORAGE_KEY, paletteId);
  } catch {
    // ignore — preview override stays in memory for this session
  }
}
