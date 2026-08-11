import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SignUpScreen } from '@/screens/auth/SignUpScreen';
import { useAuth } from '@/context/AuthContext';
import { signUpWithPassword } from '@/modules/auth';
import { useBrand } from '@/modules/settings';

export default function SignUpRoute() {
  const router = useRouter();
  const brand = useBrand();
  const { takePostLoginRedirect, setAuthUser } = useAuth();

  return (
    <>
      <StatusBar style="dark" />
      <SignUpScreen
        onBack={() => router.back()}
        onSubmitPassword={async ({ name, email, password }) => {
          const user = await signUpWithPassword({
            email,
            password,
            displayName: name,
          });
          setAuthUser(user);
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
