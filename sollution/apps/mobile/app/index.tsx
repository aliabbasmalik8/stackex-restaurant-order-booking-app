import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SignInScreen } from '@/screens/auth/SignInScreen';
import { brand } from '@/theme';

export default function SignInRoute() {
  const router = useRouter();

  const goHome = () => {
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
        onSendCode={goVerify}
        onApple={goHome}
        onGoogle={goHome}
        onCreateAccount={() => router.push('/sign-up')}
        onContinueAsGuest={goHome}
      />
    </>
  );
}
