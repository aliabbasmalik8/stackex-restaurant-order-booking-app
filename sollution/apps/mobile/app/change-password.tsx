import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChangePasswordScreen } from '@/screens/profile/ChangePasswordScreen';
import { useRequireAuthScreen } from '@/core/auth';

export default function ChangePasswordRoute() {
  const router = useRouter();
  const { allowed, authReady } = useRequireAuthScreen({
    redirectTo: '/change-password',
  });

  if (!authReady || !allowed) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <ChangePasswordScreen
        onBack={() => router.back()}
        onSaved={() => router.back()}
      />
    </>
  );
}
