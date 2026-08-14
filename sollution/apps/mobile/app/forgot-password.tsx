import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ForgotPasswordScreen } from '@/screens/auth/ForgotPasswordScreen';

export default function ForgotPasswordRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === 'string' ? params.email : '';

  return (
    <>
      <StatusBar style="dark" />
      <ForgotPasswordScreen
        initialEmail={email}
        onBack={() => router.back()}
      />
    </>
  );
}
