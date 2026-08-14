import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AddPasswordScreen } from '@/screens/profile/AddPasswordScreen';
import { useRequireAuthScreen } from '@/core/auth';

export default function AddPasswordRoute() {
  const router = useRouter();
  const { allowed, authReady } = useRequireAuthScreen({
    redirectTo: '/add-password',
  });

  if (!authReady || !allowed) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <AddPasswordScreen
        onBack={() => router.back()}
        onSaved={() => router.back()}
      />
    </>
  );
}
