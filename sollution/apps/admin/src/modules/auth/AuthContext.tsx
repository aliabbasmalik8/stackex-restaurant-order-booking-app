import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from 'firebase/auth'
import { isFirebaseConfigured } from '@/lib/firebase'
import { signOutAdmin, subscribeAdminAuth } from '@/modules/auth/api'

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  /** False until first auth resolution (or immediately if Firebase not configured). */
  authReady: boolean
  /** True when the six FIREBASE_* keys are present. */
  firebaseConfigured: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(!isFirebaseConfigured)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthReady(true)
      return
    }

    const unsub = subscribeAdminAuth((next) => {
      setUser(next)
      setAuthReady(true)
    })
    return unsub
  }, [])

  const signOut = useCallback(async () => {
    if (isFirebaseConfigured) {
      await signOutAdmin()
    }
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      authReady,
      firebaseConfigured: isFirebaseConfigured,
      signOut,
    }),
    [user, authReady, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
