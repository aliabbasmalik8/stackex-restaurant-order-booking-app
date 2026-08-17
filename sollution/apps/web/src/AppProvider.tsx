import { type ReactNode, useEffect, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/api/OrderBooking/queryClient'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import { LanguageProvider } from '@/i18n/LanguageContext'
import { CatalogProvider } from '@/core/catalog'
import { bootstrapAppSettings, SettingsProvider } from '@/core/settings'
import '@/i18n'

interface AppProviderProps {
  children: ReactNode
}

export default function AppProvider({ children }: AppProviderProps) {
  const [settingsReady, setSettingsReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        await bootstrapAppSettings()
      } finally {
        if (!cancelled) setSettingsReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!settingsReady) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <LanguageProvider>
          <AuthProvider>
            <CatalogProvider>
              <CartProvider>{children}</CartProvider>
            </CatalogProvider>
          </AuthProvider>
        </LanguageProvider>
      </SettingsProvider>
    </QueryClientProvider>
  )
}
