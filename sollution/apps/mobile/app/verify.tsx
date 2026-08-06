import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { VerifyCodeScreen } from '@/screens/auth/VerifyCodeScreen';
import { useAuth } from '@/context/AuthContext';

export default function VerifyRoute() {
  const router = useRouter();
  const { markAuthenticated, takePostLoginRedirect } = useAuth();
  const params = useLocalSearchParams<{ phone?: string; from?: string }>();
  const phone = typeof params.phone === 'string' ? params.phone : undefined;

  const goAfterAuth = () => {
    markAuthenticated();
    router.replace(takePostLoginRedirect());
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
        onVerify={goAfterAuth}
        onResend={() => {
          // UI-only — backend OTP later
        }}
      />
    </>
  );
}
