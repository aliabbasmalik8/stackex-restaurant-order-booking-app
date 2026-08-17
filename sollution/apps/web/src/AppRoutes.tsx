import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { SignInScreen } from '@/screens/auth/SignInScreen'
import { SignUpScreen } from '@/screens/auth/SignUpScreen'
import { ForgotPasswordScreen } from '@/screens/auth/ForgotPasswordScreen'
import { MenuScreen } from '@/screens/menu/MenuScreen'
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
      <Route path="*" element={<Navigate to="/menu" replace />} />
    </Routes>
  )
}
