import { sendPasswordResetEmail as firebaseSendPasswordResetEmail } from 'firebase/auth';
import { authApi } from '@/api/OrderBooking/modules/auth';
import type { EmailAuthStatus } from '@/api/OrderBooking/modules/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';
import { AuthError, toAuthError } from './errors';

export async function lookupEmailAuthStatus(
  email: string,
): Promise<EmailAuthStatus> {
  try {
    const response = await authApi.lookupEmailStatus({
      email: email.trim().toLowerCase(),
    });
    return response.status;
  } catch (error) {
    throw toAuthError(error);
  }
}

/** Firebase client mail — used when status is `password-reset-required`. */
export async function sendPasswordReset(email: string): Promise<void> {
  try {
    if (!isFirebaseConfigured()) {
      throw new AuthError('config_missing');
    }
    await firebaseSendPasswordResetEmail(
      getFirebaseAuth(),
      email.trim().toLowerCase(),
    );
  } catch (error) {
    throw toAuthError(error);
  }
}
