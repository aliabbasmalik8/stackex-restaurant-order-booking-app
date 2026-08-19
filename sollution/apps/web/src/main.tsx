import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { applyTheme, loadPreviewPalette } from '@/theme'
import { isPreviewMode } from '@/lib/previewMode'
import App from './App'
import './index.css'

applyTheme()
if (isPreviewMode()) {
  const stored = loadPreviewPalette()
  if (stored) applyTheme(stored)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
