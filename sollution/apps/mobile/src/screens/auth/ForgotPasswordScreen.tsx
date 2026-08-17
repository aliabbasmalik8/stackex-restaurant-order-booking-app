import { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { BackButton, Button, Field, Text } from '@/components/ui';
import {
  AuthError,
  authErrorMessageKey,
  lookupEmailAuthStatus,
  sendPasswordReset,
  toAuthError,
} from '@/core/auth';
import { radii, spacing, typography, createStyles, useTheme } from '@/theme';

type ForgotPasswordScreenProps = {
  initialEmail?: string;
  onBack?: () => void;
};

export function ForgotPasswordScreen({
  initialEmail = '',
  onBack,
}: ForgotPasswordScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const emailValid = email.trim().includes('@');
  const canSend = emailValid && !loading;
  const showBanner = Boolean(errorKey || resetSent);
  const bannerTone = errorKey ? 'error' : 'info';

  const dismissBanner = () => {
    setErrorKey(null);
    setResetSent(false);
  };

  const handleSend = async () => {
    if (!canSend) return;
    setLoading(true);
    setErrorKey(null);
    if (['test@stackex.ai', 'test@example.com'].includes(email.trim().toLowerCase())) {
      setResetSent(false);
      setErrorKey('auth.errors.password_reset_not_allowed');
      setLoading(false);
      return;
    }
    try {
      const status = await lookupEmailAuthStatus(email);
      if (status === 'account-not-exist') {
        setResetSent(false);
        setErrorKey('auth.errors.account_not_exist');
        return;
      }
      await sendPasswordReset(email);
      setResetSent(true);
    } catch (error) {
      const authErr =
        error instanceof AuthError ? error : toAuthError(error);
      setErrorKey(authErrorMessageKey(authErr.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <BackButton onPress={onBack} />
          </View>

          <View style={styles.header}>
            <Text variant="title">{t('auth.forgotPasswordTitle')}</Text>
            <Text variant="subtitle" color={colors.textSecondary}>
              {t('auth.forgotPasswordSubtitle')}
            </Text>
          </View>

          {showBanner ? (
            <View
              style={[
                styles.banner,
                bannerTone === 'error' ? styles.bannerError : styles.bannerInfo,
              ]}
            >
              <View
                style={[
                  styles.bannerBar,
                  bannerTone === 'error' ? styles.barError : styles.barInfo,
                ]}
              />
              <Text style={styles.bannerText} numberOfLines={2}>
                {errorKey ? t(errorKey) : t('auth.passwordResetSent')}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                onPress={dismissBanner}
                hitSlop={8}
                style={styles.bannerClose}
              >
                <Ionicons name="close" size={14} color={colors.ink} />
              </Pressable>
            </View>
          ) : null}

          <Field
            label={t('auth.email')}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (errorKey || resetSent) dismissBanner();
            }}
            placeholder={t('auth.emailPlaceholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            editable={!loading}
          />

          <Button
            label={resetSent ? t('auth.resendEmail') : t('auth.sendResetEmail')}
            onPress={() => void handleSend()}
            disabled={!canSend}
            loading={loading}
            style={styles.cta}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = createStyles((colors) => ({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenX,
  },
  topBar: {
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    paddingHorizontal: 4,
    paddingTop: 10,
    paddingBottom: 18,
    gap: 5,
  },
  banner: {
    height: 36,
    borderRadius: radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  bannerError: {
    backgroundColor: 'rgba(186, 26, 26, 0.1)',
  },
  bannerInfo: {
    backgroundColor: 'rgba(46, 204, 138, 0.14)',
  },
  bannerBar: {
    width: 3,
    alignSelf: 'stretch',
  },
  barError: {
    backgroundColor: colors.error,
  },
  barInfo: {
    backgroundColor: '#2ecc8a',
  },
  bannerText: {
    flex: 1,
    paddingHorizontal: 10,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.ink,
    lineHeight: 14,
  },
  bannerClose: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    marginTop: 16,
  },
}));
