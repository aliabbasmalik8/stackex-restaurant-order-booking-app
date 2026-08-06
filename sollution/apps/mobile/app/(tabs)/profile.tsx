import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';

export default function ProfileRoute() {
  const router = useRouter();

  return (
    <>
      <StatusBar style="dark" />
      <ProfileScreen onSignOut={() => router.replace('/')} />
    </>
  );
}
