import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { EditProfileScreen } from '@/screens/profile/EditProfileScreen';
import { AuthRequiredView, useRequireAuthScreen } from '@/modules/auth';

export default function EditProfileRoute() {
  const router = useRouter();
  const { allowed, authReady } = useRequireAuthScreen({
    redirectTo: '/edit-profile',
  });

  if (!authReady || !allowed) {
    return (
      <>
        <StatusBar style="dark" />
        <AuthRequiredView loading={!authReady} />
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <EditProfileScreen
        onBack={() => router.back()}
        onSaved={() => router.back()}
      />
    </>
  );
}
