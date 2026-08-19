import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, type ReactNode } from 'react'
import { SignInScreen } from '@/screens/auth/SignInScreen'
import { SignUpScreen } from '@/screens/auth/SignUpScreen'
import { ForgotPasswordScreen } from '@/screens/auth/ForgotPasswordScreen'
import { MenuScreen } from '@/screens/menu/MenuScreen'
import { CheckoutScreen } from '@/screens/checkout/CheckoutScreen'
import { PaymentScreen } from '@/screens/payment/PaymentScreen'
import { ConfirmationScreen } from '@/screens/order-success/ConfirmationScreen'
import { ProfileScreen } from '@/screens/profile/ProfileScreen'
import { OrdersScreen } from '@/screens/orders/OrdersScreen'
import { TrackOrderScreen } from '@/screens/orders/TrackOrderScreen'
import { useAuth } from '@/context/AuthContext'
import { signInWithPassword, signUpWithPassword, useGoogleSignIn } from '@/core/auth'

function SignInRoute() {
  const navigate = useNavigate()
  const {
    continueAsGuest,
    takePostLoginRedirect,
    setAuthUser,
    isAuthenticated,
    authReady,
  } = useAuth()
  const { signInWithGoogle } = useGoogleSignIn()

  if (authReady && isAuthenticated) {
    return <Navigate to="/menu" replace />
  }

  return (
    <SignInScreen
      onPasswordSignIn={async ({ email, password }) => {
        const user = await signInWithPassword(email, password)
        setAuthUser(user)
        navigate(takePostLoginRedirect(), { replace: true })
      }}
      onGoogle={async () => {
        const user = await signInWithGoogle()
        setAuthUser(user)
        navigate(takePostLoginRedirect(), { replace: true })
      }}
      onCreateAccount={() => navigate('/sign-up')}
      onForgotPassword={() => navigate('/forgot-password')}
      onContinueAsGuest={() => {
        continueAsGuest()
        navigate('/menu', { replace: true })
      }}
    />
  )
}

function SignUpRoute() {
  const navigate = useNavigate()
  const { takePostLoginRedirect, setAuthUser } = useAuth()

  return (
    <SignUpScreen
      onBack={() => navigate(-1)}
      onSignIn={() => navigate('/sign-in')}
      onSubmitPassword={async ({ name, email, password }) => {
        const user = await signUpWithPassword({
          email,
          password,
          displayName: name,
        })
        setAuthUser(user)
        navigate(takePostLoginRedirect(), { replace: true })
      }}
    />
  )
}

function ForgotPasswordRoute() {
  const navigate = useNavigate()
  return <ForgotPasswordScreen onBack={() => navigate(-1)} />
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, authReady, requireAuth } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      requireAuth(location.pathname)
    }
  }, [authReady, isAuthenticated, location.pathname, requireAuth])

  if (!authReady) {
    return (
      <div className="grid h-full place-items-center text-sm font-semibold text-sub">
        …
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />
  }

  return children
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sign-in" replace />} />
      <Route path="/sign-in" element={<SignInRoute />} />
      <Route path="/sign-up" element={<SignUpRoute />} />
      <Route
        path="/forgot-password"
        element={<ForgotPasswordRoute />}
      />
      <Route path="/menu" element={<MenuScreen />} />
      <Route
        path="/checkout"
        element={
          <RequireAuth>
            <CheckoutScreen />
          </RequireAuth>
        }
      />
      <Route
        path="/payment"
        element={
          <RequireAuth>
            <PaymentScreen />
          </RequireAuth>
        }
      />
      <Route
        path="/order-success"
        element={
          <RequireAuth>
            <ConfirmationScreen />
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <ProfileScreen />
          </RequireAuth>
        }
      />
      <Route
        path="/orders"
        element={
          <RequireAuth>
            <OrdersScreen />
          </RequireAuth>
        }
      />
      <Route
        path="/orders/:orderId"
        element={
          <RequireAuth>
            <TrackOrderScreen />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/menu" replace />} />
    </Routes>
  )
}
