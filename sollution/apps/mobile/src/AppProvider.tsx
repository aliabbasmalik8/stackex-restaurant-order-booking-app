import { ReactNode, useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import {
  Sora_600SemiBold,
  Sora_700Bold,
} from '@expo-google-fonts/sora';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/api/OrderBooking/queryClient';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { CatalogProvider } from '@/core/catalog';
import {
  bootstrapAppSettings,
  SettingsProvider,
} from '@/core/settings';
import { PaymentsProvider } from '@/features/stripe-payment';
import { ThemeProvider, applyPalette } from '@/theme';
import { loadPreviewPalette } from '@/theme/previewPaletteStorage';
import { isPreviewMode } from '@/lib/previewMode';
import '@/i18n';

SplashScreen.preventAutoHideAsync();

interface AppProviderProps {
  children: ReactNode;
}

const AppProvider = ({ children }: AppProviderProps) => {
  const [fontsLoaded, fontError] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  const [settingsReady, setSettingsReady] = useState(false);
  const [paletteReady, setPaletteReady] = useState(!isPreviewMode());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await bootstrapAppSettings();
      } finally {
        if (!cancelled) setSettingsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isPreviewMode()) return;
    let cancelled = false;
    (async () => {
      try {
        const stored = await loadPreviewPalette();
        if (stored && !cancelled) applyPalette(stored);
      } finally {
        if (!cancelled) setPaletteReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ready = (fontsLoaded || fontError) && settingsReady && paletteReady;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <SettingsProvider>
            <LanguageProvider>
              <PaymentsProvider>
                <AuthProvider>
                  <CatalogProvider>
                    <CartProvider>{children}</CartProvider>
                  </CatalogProvider>
                </AuthProvider>
              </PaymentsProvider>
            </LanguageProvider>
          </SettingsProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default AppProvider;
