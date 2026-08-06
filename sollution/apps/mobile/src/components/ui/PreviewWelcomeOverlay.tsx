import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BrandMark, Text } from '@/components/ui';
import {
  hasShownPreviewWelcome,
  isPreviewMode,
  markPreviewWelcomeShown,
  PREVIEW_WELCOME_MS,
} from '@/lib/previewMode';
import { brand, colors, radii, spacing, typography } from '@/theme';

/**
 * Full-screen preview greeting on first visit to sign-in when
 * `EXPO_PUBLIC_PREVIEW_MODE=1`. Auto-hides after a few seconds; Skip available.
 */
export function PreviewWelcomeOverlay() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const dismissed = useRef(false);

  const dismiss = () => {
    if (dismissed.current) return;
    dismissed.current = true;
    setVisible(false);
    void markPreviewWelcomeShown();
  };

  useEffect(() => {
    if (!isPreviewMode()) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    void (async () => {
      const already = await hasShownPreviewWelcome();
      if (cancelled || already) return;
      setVisible(true);
      timer = setTimeout(() => {
        if (!cancelled) dismiss();
      }, PREVIEW_WELCOME_MS);
    })();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // dismiss is stable enough via ref; run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: Math.max(insets.top, 28),
          paddingBottom: Math.max(insets.bottom, 24),
        },
      ]}
      accessibilityViewIsModal
    >
      <View pointerEvents="none" style={styles.watermarkWrap}>
        <Text style={styles.watermark}>{brand.monogram}</Text>
      </View>

      <View style={styles.body}>
        <BrandMark />
        <Text style={styles.eyebrow}>{t('preview.eyebrow')}</Text>
        <Text style={styles.title}>{t('preview.title')}</Text>
        <Text style={styles.message}>{t('preview.message')}</Text>

        <View style={styles.loaderWrap}>
          <ActivityIndicator color={colors.onHero} size="large" />
          <Text style={styles.loaderHint}>{t('preview.loadingHint')}</Text>
        </View>
      </View>

      <Pressable
        onPress={dismiss}
        style={({ pressed }) => [styles.skip, pressed && styles.skipPressed]}
        hitSlop={8}
      >
        <Text style={styles.skipText}>{t('preview.skip')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    backgroundColor: colors.hero,
    paddingHorizontal: spacing.screenX,
    justifyContent: 'space-between',
  },
  watermarkWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingRight: -20,
    overflow: 'hidden',
  },
  watermark: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 220,
    fontWeight: typography.fontWeight.bold,
    color: colors.onHeroFaint,
    lineHeight: 220,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 24,
  },
  eyebrow: {
    marginTop: 28,
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.onHeroMuted,
    textAlign: 'center',
  },
  title: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -0.5,
    color: colors.onHero,
    lineHeight: 34,
    textAlign: 'center',
  },
  message: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 15,
    fontWeight: typography.fontWeight.semibold,
    color: colors.onHeroSoft,
    lineHeight: 22,
    maxWidth: 300,
    textAlign: 'center',
  },
  loaderWrap: {
    marginTop: 32,
    alignItems: 'center',
    gap: 12,
  },
  loaderHint: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.onHeroMuted,
    textAlign: 'center',
  },
  skip: {
    alignSelf: 'center',
    minHeight: 48,
    paddingHorizontal: 28,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.heroGlassBorder,
    backgroundColor: colors.heroGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipPressed: { opacity: 0.85 },
  skipText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 14.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.onHero,
  },
});
