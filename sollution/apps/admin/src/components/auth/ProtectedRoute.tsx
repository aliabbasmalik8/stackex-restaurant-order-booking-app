import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/modules/auth'
import { Text } from '@/components/ui'

/** Blocks non-admin / signed-out users; waits for auth boot. */
export function ProtectedRoute() {
  const { authReady, isAuthenticated, apiConfigured } = useAuth()

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <Text variant="subtitle" className="text-sub">
          …
        </Text>
      </div>
    )
  }

  if (!apiConfigured || !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
