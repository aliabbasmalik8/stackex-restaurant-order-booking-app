import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { VerifyCodeScreen } from '@/screens/auth/VerifyCodeScreen';

export default function VerifyRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string; from?: string }>();
  const phone = typeof params.phone === 'string' ? params.phone : undefined;

  const goHome = () => {
    router.replace('/(tabs)/menu');
  };

  return (
    <>
      <StatusBar style="dark" />
      <VerifyCodeScreen
        phone={phone}
        onBack={() => router.back()}
        onChangeNumber={() => {
          if (params.from === 'sign-up') {
            router.replace('/sign-up');
          } else {
            router.replace('/');
          }
        }}
        onVerify={goHome}
        onResend={() => {
          // UI-only — backend OTP later
        }}
      />
    </>
  );
}
