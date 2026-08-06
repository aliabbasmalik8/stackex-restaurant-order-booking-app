import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SignUpScreen } from '@/screens/auth/SignUpScreen';
import { brand } from '@/theme';

export default function SignUpRoute() {
  const router = useRouter();

  return (
    <>
      <StatusBar style="dark" />
      <SignUpScreen
        onBack={() => router.back()}
        onSubmit={({ phone }) => {
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
