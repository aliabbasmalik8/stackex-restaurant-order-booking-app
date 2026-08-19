import { useCallback, useState } from 'react'
import { getFirebaseAuth } from '@/lib/firebase'
import {
  isGoogleSignInConfigured,
  linkGooglePopup,
  signInWithGooglePopup,
} from './google'
import { AuthError, toAuthError } from './errors'

type ConnectGoogleState = {
  connectGoogle: () => Promise<void>
  ready: boolean
  loading: boolean
}

/** Link Google onto the current Firebase user (profile sign-in methods). */
export function useConnectGoogle(): ConnectGoogleState {
  const [loading, setLoading] = useState(false)

  const connectGoogle = useCallback(async () => {
    if (!isGoogleSignInConfigured()) {
      throw new AuthError('config_missing')
    }
    setLoading(true)
    try {
      const auth = getFirebaseAuth()
      await auth.authStateReady()
      if (auth.currentUser) {
        await linkGooglePopup()
        return
      }
      // Nest JWT can survive a refresh while in-memory Firebase does not.
      await signInWithGooglePopup()
    } catch (error) {
      throw toAuthError(error)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    connectGoogle,
    ready: isGoogleSignInConfigured(),
    loading,
  }
}
