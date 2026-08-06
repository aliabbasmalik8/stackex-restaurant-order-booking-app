import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SignUpScreen } from '@/screens/auth/SignUpScreen';
import { useAuth } from '@/context/AuthContext';
import { brand } from '@/theme';

export default function SignUpRoute() {
  const router = useRouter();
  const { markAuthenticated, takePostLoginRedirect } = useAuth();

  return (
    <>
      <StatusBar style="dark" />
      <SignUpScreen
        onBack={() => router.back()}
        onSubmitPassword={() => {
          // UI stub — Firebase Auth email/password later
          markAuthenticated();
          router.replace(takePostLoginRedirect());
        }}
        onSubmitPhone={({ phone }) => {
          const full = `${brand.dialCode} ${phone}`.trim();
          router.push({
            pathname: '/verify',
            params: { phone: full, from: 'sign-up' },
          });
        }}
      />
    </>
  );
}
