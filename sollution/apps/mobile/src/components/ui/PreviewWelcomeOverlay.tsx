import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BrandMark } from './BrandMark';
import { DineOsMark } from './DineOsMark';
import { DineOsWordmark } from './DineOsWordmark';
import { Text } from './Text';
import {
  hasShownPreviewWelcome,
  isPreviewMode,
  markPreviewWelcomeShown,
  PREVIEW_WELCOME_MS,
} from '@/lib/previewMode';
import { radii, spacing, typography, createStyles, useTheme } from '@/theme';

const FILL_SIZE = 56;

/**
 * Full-screen preview greeting on first visit to sign-in when
 * `EXPO_PUBLIC_PREVIEW_MODE=1`. Auto-hides after a few seconds; Skip available.
 */
export function PreviewWelcomeOverlay() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const dismissed = useRef(false);
  const fill = useRef(new Animated.Value(0)).current;

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
    let anim: Animated.CompositeAnimation | undefined;

    void (async () => {
      const already = await hasShownPreviewWelcome();
      if (cancelled || already) return;
      setVisible(true);
      fill.setValue(0);
      anim = Animated.timing(fill, {
        toValue: 1,
        duration: PREVIEW_WELCOME_MS,
        easing: Easing.linear,
        useNativeDriver: false,
      });
      anim.start();
      timer = setTimeout(() => {
        if (!cancelled) dismiss();
      }, PREVIEW_WELCOME_MS);
    })();

    return () => {
      cancelled = true;
      anim?.stop();
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  const fillHeight = fill.interpolate({
    inputRange: [0, 1],
    outputRange: [0, FILL_SIZE],
  });

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
        <DineOsMark size={220} color={colors.onHeroFaint} />
      </View>

      <View style={styles.body}>
        <BrandMark />
        <DineOsWordmark />
        <Text style={styles.eyebrow}>{t('preview.eyebrow')}</Text>
        <Text style={styles.title}>{t('preview.title')}</Text>
        <Text style={styles.message}>{t('preview.message')}</Text>

        <View style={styles.notice} accessibilityRole="text">
          <Text style={styles.noticeTitle}>{t('preview.privacyTitle')}</Text>
          <Text style={styles.noticeBody}>{t('preview.privacyBody')}</Text>
        </View>

        <View style={styles.loaderWrap}>
          <View style={styles.fillCircle} accessibilityRole="progressbar">
            <View style={styles.fillTrack}>
              <Animated.View
                style={[styles.fillColor, { height: fillHeight }]}
              />
            </View>
          </View>
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

const styles = createStyles((colors) => ({
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
  notice: {
    marginTop: 8,
    maxWidth: 320,
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: '#e8a0a0',
    backgroundColor: '#ffe8e8',
    gap: 6,
  },
  noticeTitle: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: '#7a1212',
    textAlign: 'center',
  },
  noticeBody: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: '#5c1a1a',
    lineHeight: 19,
    textAlign: 'center',
  },
  loaderWrap: {
    marginTop: 28,
    alignItems: 'center',
    gap: 12,
  },
  fillCircle: {
    width: FILL_SIZE,
    height: FILL_SIZE,
    borderRadius: FILL_SIZE / 2,
    borderWidth: 2.5,
    borderColor: colors.onHero,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  fillTrack: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  fillColor: {
    width: '100%',
    backgroundColor: colors.primary,
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
}));
