import { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  BrandMark,
  LanguageModal,
  PreviewWelcomeOverlay,
  Text,
} from '@/components/ui';
import {
  PasswordLoginForm,
  PhoneLoginForm,
  SocialLoginButtons,
  type PasswordLoginValues,
} from '@/feature-ui/auth';
import {
  shouldRenderPasswordAuth,
  shouldRenderPhoneAuth,
} from '@/features/auth';
import { useBrand } from '@/core/settings';
import { LOCALE_META } from '@/i18n';
import { useLanguage } from '@/i18n/LanguageContext';
import { colors, radii, spacing, typography } from '@/theme';

interface SignInScreenProps {
  onSendCode?: (phone: string) => void;
  onPasswordSignIn?: (
    values: PasswordLoginValues,
  ) => void | Promise<void>;
  onApple?: () => void | Promise<void>;
  onGoogle?: () => void | Promise<void>;
  onCreateAccount?: () => void;
  onContinueAsGuest?: () => void;
}

export const SignInScreen = ({
  onSendCode,
  onPasswordSignIn,
  onApple,
  onGoogle,
  onCreateAccount,
  onContinueAsGuest,
}: SignInScreenProps) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const brand = useBrand();
  const { locale } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 20) }]}>
      <View pointerEvents="none" style={styles.watermarkWrap}>
        <Text style={styles.watermark}>{brand.monogram}</Text>
      </View>

      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('profile.language')}
          onPress={() => setLangOpen(true)}
          style={styles.langChip}
          hitSlop={8}
        >
          <Text style={styles.langChipText}>
            {t(LOCALE_META[locale].nativeKey)}
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <BrandMark />
            <View style={styles.headerCopy}>
              <Text variant="display" color={colors.onHero}>
                {t('auth.welcomeBack')}
              </Text>
              <Text variant="subtitle" color={colors.onHeroSoft}>
                {t('auth.signInSubtitle')}
              </Text>
            </View>
          </View>

          {shouldRenderPasswordAuth() ? (
            <PasswordLoginForm onSubmit={onPasswordSignIn} />
          ) : null}

          {shouldRenderPhoneAuth() ? (
            <PhoneLoginForm onSendCode={onSendCode} />
          ) : null}

          <SocialLoginButtons onApple={onApple} onGoogle={onGoogle} />

          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, spacing.screenBottom) },
            ]}
          >
            <Pressable
              accessibilityRole="link"
              onPress={onCreateAccount}
              style={styles.footerRow}
            >
              <Text style={styles.footerMuted}>{t('auth.newHere')} </Text>
              <Text style={styles.footerLink}>{t('auth.createAccount')}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onContinueAsGuest}>
              <Text style={styles.guest}>{t('auth.continueAsGuest')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PreviewWelcomeOverlay />
      <LanguageModal visible={langOpen} onClose={() => setLangOpen(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.hero,
    overflow: 'hidden',
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenX,
  },
  topBar: {
    paddingHorizontal: spacing.screenX,
    alignItems: 'flex-end',
    zIndex: 2,
  },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  langChipText: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 12.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.onHero,
  },
  watermarkWrap: {
    position: 'absolute',
    right: -30,
    top: 60,
  },
  watermark: {
    fontFamily: typography.fontFamilyDisplay,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.watermark,
    color: colors.onHeroFaint,
    lineHeight: typography.fontSize.watermark,
  },
  header: {
    paddingTop: 48,
    gap: 16,
  },
  headerCopy: {
    gap: 6,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 32,
    alignItems: 'center',
    gap: 14,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerMuted: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.bold,
    color: 'rgba(255,255,255,0.8)',
  },
  footerLink: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.onHero,
    textDecorationLine: 'underline',
  },
  guest: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.onHeroMuted,
  },
});
