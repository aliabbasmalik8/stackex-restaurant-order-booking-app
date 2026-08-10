import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LoginScreen } from '@/screens/LoginScreen'
import { WelcomeScreen } from '@/screens/WelcomeScreen'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<WelcomeScreen />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
