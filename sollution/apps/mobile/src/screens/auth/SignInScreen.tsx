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
import { BrandMark, PreviewWelcomeOverlay, Text } from '@/components/ui';
import {
  getServiceStatus,
  isServiceInteractive,
  shouldRenderService,
} from '@/modules/services';
import { useBrand } from '@/modules/settings';
import { colors, spacing, typography } from '@/theme';
import {
  PasswordLoginForm,
  PhoneLoginForm,
  SocialLoginButtons,
  type PasswordLoginValues,
} from './components';

interface SignInScreenProps {
  onSendCode?: (phone: string) => void;
  onPasswordSignIn?: (
    values: PasswordLoginValues,
  ) => void | Promise<void>;
  onApple?: () => void;
  onGoogle?: () => void;
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
  const guest = getServiceStatus('continueAsGuest');

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 20) }]}>
      <View pointerEvents="none" style={styles.watermarkWrap}>
        <Text style={styles.watermark}>{brand.monogram}</Text>
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

          {shouldRenderService('passwordLogin') ? (
            <PasswordLoginForm onSubmit={onPasswordSignIn} />
          ) : null}

          {shouldRenderService('phoneLogin') ? (
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
            {shouldRenderService('continueAsGuest') ? (
              <Pressable
                accessibilityRole="button"
                disabled={!isServiceInteractive('continueAsGuest')}
                onPress={onContinueAsGuest}
              >
                <Text
                  style={[
                    styles.guest,
                    !isServiceInteractive('continueAsGuest') &&
                      styles.guestDisabled,
                  ]}
                >
                  {t('auth.continueAsGuest')}
                </Text>
              </Pressable>
            ) : null}
            {guest.reasonKey ? (
              <Text style={styles.serviceHint}>{t(guest.reasonKey)}</Text>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PreviewWelcomeOverlay />
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
    paddingTop: 80,
    gap: 16,
  },
  headerCopy: {
    gap: 6,
  },
  serviceHint: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.onHeroMuted,
    textAlign: 'center',
    lineHeight: 16,
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
  guestDisabled: {
    opacity: 0.45,
  },
});
