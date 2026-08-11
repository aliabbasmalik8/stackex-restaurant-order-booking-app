import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { useAuth } from '@/context/AuthContext';
import { AuthRequiredView, useRequireAuthScreen } from '@/core/auth';

export default function ProfileRoute() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { allowed, authReady } = useRequireAuthScreen({
    redirectTo: '/(tabs)/profile',
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
      <ProfileScreen
        onEditProfile={() => router.push('/edit-profile')}
        onSignOut={() => {
          void (async () => {
            await signOut();
            router.replace('/');
          })();
        }}
      />
    </>
  );
}
