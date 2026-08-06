import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SignInScreen } from '@/screens/auth/SignInScreen';
import { useAuth } from '@/context/AuthContext';
import { signInWithPassword } from '@/modules/auth';
import { brand } from '@/theme';

export default function SignInRoute() {
  const router = useRouter();
  const {
    continueAsGuest,
    markAuthenticated,
    takePostLoginRedirect,
    setAuthUser,
  } = useAuth();

  const goAfterAuth = () => {
    markAuthenticated();
    router.replace(takePostLoginRedirect());
  };

  const goGuest = () => {
    continueAsGuest();
    router.replace('/(tabs)/menu');
  };

  const goVerify = (phone: string) => {
    const full = `${brand.dialCode} ${phone}`.trim();
    router.push({
      pathname: '/verify',
      params: { phone: full, from: 'sign-in' },
    });
  };

  return (
    <>
      <StatusBar style="light" />
      <SignInScreen
        onPasswordSignIn={async ({ email, password }) => {
          const user = await signInWithPassword(email, password);
          setAuthUser(user);
          router.replace(takePostLoginRedirect());
        }}
        onSendCode={goVerify}
        onApple={goAfterAuth}
        onGoogle={goAfterAuth}
        onCreateAccount={() => router.push('/sign-up')}
        onContinueAsGuest={goGuest}
      />
    </>
  );
}
