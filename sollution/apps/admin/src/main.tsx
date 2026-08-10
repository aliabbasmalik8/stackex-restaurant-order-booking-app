import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { applyTheme } from '@/theme'
import '@/i18n'
import App from './App'
import './index.css'

applyTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
