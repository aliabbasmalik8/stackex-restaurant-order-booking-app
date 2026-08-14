import {
  EmailAuthProvider,
  linkWithCredential,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { AuthError, toAuthError } from './errors';
import { requireFirebaseUser } from './signInMethods';

export async function addPasswordToAccount(password: string): Promise<void> {
  try {
    const user = requireFirebaseUser();
    const email = user.email?.trim();
    if (!email) {
      throw new AuthError('invalid_email');
    }
    if (password.trim().length < 6) {
      throw new AuthError('weak_password');
    }
    const credential = EmailAuthProvider.credential(email, password);
    await linkWithCredential(user, credential);
    await user.reload();
  } catch (error) {
    throw toAuthError(error);
  }
}

export async function changeAccountPassword(input: {
  currentPassword: string;
  nextPassword: string;
}): Promise<void> {
  try {
    const user = requireFirebaseUser();
    const email = user.email?.trim();
    if (!email) {
      throw new AuthError('invalid_email');
    }
    if (input.nextPassword.trim().length < 6) {
      throw new AuthError('weak_password');
    }
    const current = EmailAuthProvider.credential(email, input.currentPassword);
    await reauthenticateWithCredential(user, current);
    await updatePassword(user, input.nextPassword);
    await user.reload();
  } catch (error) {
    throw toAuthError(error);
  }
}
