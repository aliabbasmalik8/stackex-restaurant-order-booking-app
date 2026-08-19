import type { ReactNode } from 'react'
import { setPaletteId } from './useTheme'
import { usePreviewPalettePostMessage } from './usePreviewPalettePostMessage'

type ThemeProviderProps = {
  children: ReactNode
}

/** Preview iframe postMessage → live palette (also persisted). */
export function ThemeProvider({ children }: ThemeProviderProps) {
  usePreviewPalettePostMessage(setPaletteId)
  return children
}
