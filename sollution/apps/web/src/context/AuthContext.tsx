import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  USER_PROFILE_QUERY_KEY,
  userApi,
  type UserProfile,
} from '@/api/OrderBooking/modules/user'
import { signOutUser } from '@/core/auth/password'
import {
  authUserFromProfile,
  mergeAuthProfile,
  profileFromApiUser,
  profileFromUser,
  type AuthProfile,
  type AuthUser,
} from '@/core/auth/profile'
import type { SaveUserProfileInput, UserProfileDoc } from '@/core/profile'
import {
  clearAuthSession,
  getAccessToken,
  hydrateAuthSession,
  onAuthSessionCleared,
} from '@/utils/auth/session'

export const DEFAULT_POST_LOGIN_HREF = '/menu'

export type AuthStatus = 'guest' | 'authenticated'

type AuthContextValue = {
  status: AuthStatus
  isAuthenticated: boolean
  isGuest: boolean
  user: AuthUser | null
  profile: AuthProfile | null
  userProfileDoc: UserProfileDoc | null
  authReady: boolean
  profileLoading: boolean
  redirectAfterLogin: string | null
  continueAsGuest: () => void
  markAuthenticated: () => void
  setAuthUser: (next: AuthUser | null, profile?: UserProfile | null) => void
  updateUserProfile: (input: SaveUserProfileInput) => Promise<UserProfileDoc>
  refreshUserProfile: () => Promise<void>
  signOut: () => Promise<void>
  requireAuth: (redirectTo?: string | null) => boolean
  takePostLoginRedirect: () => string
  rememberPostLoginRedirect: (redirectTo?: string | null) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function toProfileDoc(user: UserProfile): UserProfileDoc {
  return {
    uid: user.id,
    contactPhone: user.contactPhone,
    createdAt:
      typeof user.created_at === 'string'
        ? user.created_at
        : new Date(user.created_at).toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [apiProfile, setApiProfile] = useState<UserProfile | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [stubAuthenticated, setStubAuthenticated] = useState(false)
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(
    null,
  )

  const applyProfile = useCallback(
    (profile: UserProfile | null) => {
      setApiProfile(profile)
      if (profile) {
        setUser(authUserFromProfile(profile))
        queryClient.setQueryData(USER_PROFILE_QUERY_KEY, profile)
      } else {
        setUser(null)
        queryClient.removeQueries({ queryKey: USER_PROFILE_QUERY_KEY })
      }
    },
    [queryClient],
  )

  const loadUserProfile = useCallback(async () => {
    if (!getAccessToken()) {
      applyProfile(null)
      return
    }
    setProfileLoading(true)
    try {
      const profile = await userApi.getProfile()
      applyProfile(profile)
      setStubAuthenticated(false)
    } catch {
      await clearAuthSession()
      applyProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }, [applyProfile])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      await hydrateAuthSession()
      if (cancelled) return
      if (getAccessToken()) {
        await loadUserProfile()
      }
      if (!cancelled) setAuthReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [loadUserProfile])

  useEffect(() => {
    return onAuthSessionCleared(() => {
      applyProfile(null)
      setStubAuthenticated(false)
    })
  }, [applyProfile])

  const userProfileDoc = useMemo(
    () => (apiProfile ? toProfileDoc(apiProfile) : null),
    [apiProfile],
  )

  const isAuthenticated = Boolean(user) || stubAuthenticated
  const status: AuthStatus = isAuthenticated ? 'authenticated' : 'guest'
  const profile = useMemo(() => {
    if (apiProfile) return profileFromApiUser(apiProfile)
    return mergeAuthProfile(profileFromUser(user), userProfileDoc)
  }, [apiProfile, user, userProfileDoc])

  const continueAsGuest = useCallback(() => {
    setStubAuthenticated(false)
    setRedirectAfterLogin(null)
  }, [])

  const markAuthenticated = useCallback(() => {
    setStubAuthenticated(true)
  }, [])

  const setAuthUser = useCallback(
    (next: AuthUser | null, profile?: UserProfile | null) => {
      if (profile) {
        applyProfile(profile)
      } else if (next) {
        setUser(next)
        setStubAuthenticated(false)
        void loadUserProfile()
      } else {
        applyProfile(null)
      }
    },
    [applyProfile, loadUserProfile],
  )

  const refreshUserProfile = useCallback(async () => {
    if (!getAccessToken()) {
      applyProfile(null)
      return
    }
    await loadUserProfile()
  }, [applyProfile, loadUserProfile])

  const updateUserProfile = useCallback(
    async (input: SaveUserProfileInput) => {
      if (!user) {
        throw new Error('Not signed in')
      }
      const saved = await userApi.updateProfile({
        name: input.displayName,
        contactPhone: input.contactPhone,
      })
      applyProfile(saved)
      return toProfileDoc(saved)
    },
    [applyProfile, user],
  )

  const signOut = useCallback(async () => {
    setStubAuthenticated(false)
    setRedirectAfterLogin(null)
    await signOutUser()
    applyProfile(null)
    queryClient.clear()
  }, [applyProfile, queryClient])

  const rememberPostLoginRedirect = useCallback(
    (redirectTo?: string | null) => {
      if (redirectTo === undefined) return
      setRedirectAfterLogin(redirectTo)
    },
    [],
  )

  const requireAuth = useCallback(
    (redirectTo?: string | null) => {
      if (isAuthenticated) return true
      if (redirectTo !== undefined) {
        setRedirectAfterLogin(redirectTo === null ? null : redirectTo)
      } else {
        setRedirectAfterLogin(DEFAULT_POST_LOGIN_HREF)
      }
      return false
    },
    [isAuthenticated],
  )

  const takePostLoginRedirect = useCallback(() => {
    const target = redirectAfterLogin ?? DEFAULT_POST_LOGIN_HREF
    setRedirectAfterLogin(null)
    return target
  }, [redirectAfterLogin])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      isAuthenticated,
      isGuest: !isAuthenticated,
      user,
      profile,
      userProfileDoc,
      authReady,
      profileLoading,
      redirectAfterLogin,
      continueAsGuest,
      markAuthenticated,
      setAuthUser,
      updateUserProfile,
      refreshUserProfile,
      signOut,
      requireAuth,
      takePostLoginRedirect,
      rememberPostLoginRedirect,
    }),
    [
      status,
      isAuthenticated,
      user,
      profile,
      userProfileDoc,
      authReady,
      profileLoading,
      redirectAfterLogin,
      continueAsGuest,
      markAuthenticated,
      setAuthUser,
      updateUserProfile,
      refreshUserProfile,
      signOut,
      requireAuth,
      takePostLoginRedirect,
      rememberPostLoginRedirect,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
