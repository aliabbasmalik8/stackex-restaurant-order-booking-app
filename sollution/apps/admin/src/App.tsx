import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from '@/i18n/LanguageContext'
import { AuthProvider } from '@/modules/auth'
import { AppRoutes } from './AppRoutes'

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        {/* BrowserRouter — host must fall back unknown paths to index.html */}
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}
