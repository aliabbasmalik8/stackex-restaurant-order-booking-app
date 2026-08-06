import { StatusBar } from 'expo-status-bar';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';

export default function ProfileRoute() {
  return (
    <>
      <StatusBar style="dark" />
      <ProfileScreen />
    </>
  );
}
