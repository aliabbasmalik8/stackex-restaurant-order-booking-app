import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppProvider from '@/AppProvider';
import { LoginRequiredModal } from '@/components/ui/LoginRequiredModal';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="sign-up" />
          <Stack.Screen name="verify" />
          <Stack.Screen
            name="(tabs)"
            options={{ animation: 'fade', gestureEnabled: false }}
          />
          <Stack.Screen
            name="item/[id]"
            options={{
              presentation: 'transparentModal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen name="cart" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="payment" />
          <Stack.Screen name="edit-profile" />
          <Stack.Screen name="order-success" options={{ animation: 'fade' }} />
        </Stack>
        <LoginRequiredModal />
      </AppProvider>
    </SafeAreaProvider>
  );
}
