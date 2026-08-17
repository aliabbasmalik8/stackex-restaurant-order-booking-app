import { useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'

export function useAuthAction(redirectTo?: string | null) {
  const { requireAuth } = useAuth()

  return useCallback(
    (fn?: () => void): boolean => {
      if (!requireAuth(redirectTo)) return false
      fn?.()
      return true
    },
    [requireAuth, redirectTo],
  )
}
