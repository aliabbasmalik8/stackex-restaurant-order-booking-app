import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/api/OrderBooking/queryClient'
import { LanguageProvider } from '@/i18n/LanguageContext'
import { AuthProvider } from '@/modules/auth'
import { AppRoutes } from './AppRoutes'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          {/* BrowserRouter — host must fall back unknown paths to index.html */}
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  )
}
