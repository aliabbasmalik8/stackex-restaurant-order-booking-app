import { useEffect } from 'react';
import { isPreviewMode } from '@/lib/previewMode';
import { parsePreviewPaletteMessage } from './previewPaletteMessage';
import type { PaletteId } from './palettes';

/**
 * Preview iframe: parent posts `{ source: 'preview-host', type: 'setPalette', paletteId }`.
 */
export function usePreviewPalettePostMessage(
  setPaletteId: (id: PaletteId) => void,
): void {
  useEffect(() => {
    if (!isPreviewMode()) return;

    const onMessage = (event: MessageEvent) => {
      if (window.parent !== window && event.source !== window.parent) return;
      const next = parsePreviewPaletteMessage(event.data);
      if (next) setPaletteId(next);
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [setPaletteId]);
}
