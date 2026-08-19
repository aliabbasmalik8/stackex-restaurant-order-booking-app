import { authApi } from '@/api/OrderBooking/modules/auth'
import { setAuthSession } from '@/utils/auth/session'
import type { AuthUser } from './profile'
import { authUserFromProfile } from './profile'

export async function exchangeFirebaseIdToken(
  idToken: string,
): Promise<AuthUser> {
  const response = await authApi.loginWithFirebase({ idToken })
  await setAuthSession({
    token: response.token,
    refreshToken: response.refreshToken,
  })
  return authUserFromProfile(response.user)
}
