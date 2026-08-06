import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppProvider from '@/AppProvider';

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
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
