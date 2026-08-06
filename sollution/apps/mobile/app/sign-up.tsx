import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SignUpScreen } from '@/screens/auth/SignUpScreen';
import { useAuth } from '@/context/AuthContext';
import { signUpWithPassword } from '@/modules/auth';
import { brand } from '@/theme';

export default function SignUpRoute() {
  const router = useRouter();
  const { takePostLoginRedirect } = useAuth();

  return (
    <>
      <StatusBar style="dark" />
      <SignUpScreen
        onBack={() => router.back()}
        onSubmitPassword={async ({ name, email, password }) => {
          await signUpWithPassword({
            email,
            password,
            displayName: name,
          });
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
