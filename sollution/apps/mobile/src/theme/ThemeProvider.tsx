import type { ReactNode } from 'react';
import { setPaletteId } from './useTheme';
import { usePreviewPalettePostMessage } from './usePreviewPalettePostMessage';

type ThemeProviderProps = {
  children: ReactNode;
};

/** Preview web postMessage → live palette (also persisted). Native listener is a no-op. */
export function ThemeProvider({ children }: ThemeProviderProps) {
  usePreviewPalettePostMessage(setPaletteId);
  return <>{children}</>;
}
