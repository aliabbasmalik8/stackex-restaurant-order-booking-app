import { useEffect } from 'react'
import { connectAdminLive, disconnectAdminLive } from '@/api/OrderBooking/Live'
import { useAuth } from '@/modules/auth'
import { useLiveInvalidateQueries } from './hooks/useLiveInvalidateQueries'

/** Connects the admin SSE singleton while logged in. Mount once near the app root. */
export function LiveInitializer() {
  const { isAuthenticated, authReady } = useAuth()

  useEffect(() => {
    if (!authReady || !isAuthenticated) {
      disconnectAdminLive()
      return
    }
    connectAdminLive()
    return () => disconnectAdminLive()
  }, [authReady, isAuthenticated])

  useLiveInvalidateQueries()
  return null
}
