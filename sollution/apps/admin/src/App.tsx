import { HashRouter } from 'react-router-dom'
import { LanguageProvider } from '@/i18n/LanguageContext'
import { AuthProvider } from '@/modules/auth'
import { AppRoutes } from './AppRoutes'

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        {/* HashRouter = static-host friendly (no nginx SPA fallback required) */}
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}
