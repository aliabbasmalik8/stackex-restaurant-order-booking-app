import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { useAuth } from '@/context/AuthContext';

export default function ProfileRoute() {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <>
      <StatusBar style="dark" />
      <ProfileScreen
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
