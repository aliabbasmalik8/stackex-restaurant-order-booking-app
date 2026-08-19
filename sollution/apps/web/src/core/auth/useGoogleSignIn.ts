import { useCallback, useState } from 'react'
import { isGoogleSignInConfigured, signInWithGooglePopup } from './google'
import { AuthError, toAuthError } from './errors'
import type { AuthUser } from './profile'

type GoogleSignInState = {
  signInWithGoogle: () => Promise<AuthUser>
  ready: boolean
  loading: boolean
}

export function useGoogleSignIn(): GoogleSignInState {
  const [loading, setLoading] = useState(false)

  const signInWithGoogle = useCallback(async (): Promise<AuthUser> => {
    if (!isGoogleSignInConfigured()) {
      throw new AuthError('config_missing')
    }

    setLoading(true)
    try {
      const user = await signInWithGooglePopup()
      return user
    } catch (error) {
      throw toAuthError(error)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    signInWithGoogle,
    ready: isGoogleSignInConfigured(),
    loading,
  }
}
