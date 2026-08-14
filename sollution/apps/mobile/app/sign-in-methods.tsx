import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SignInMethodsScreen } from '@/screens/profile/SignInMethodsScreen';
import { useRequireAuthScreen } from '@/core/auth';

export default function SignInMethodsRoute() {
  const router = useRouter();
  const { allowed, authReady } = useRequireAuthScreen({
    redirectTo: '/sign-in-methods',
  });

  if (!authReady || !allowed) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <SignInMethodsScreen
        onBack={() => router.back()}
        onAddPassword={() => router.push('/add-password')}
        onChangePassword={() => router.push('/change-password')}
      />
    </>
  );
}
