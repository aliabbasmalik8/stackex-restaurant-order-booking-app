import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BackButton, PreviewThemeChip, Text } from '@/components/ui';
import {
  CreateAccountPasswordForm,
  CreateAccountPhoneForm,
  type CreateAccountPasswordValues,
  type CreateAccountPhoneValues,
} from '@/feature-ui/auth';
import {
  shouldRenderPasswordAuth,
  shouldRenderPhoneAuth,
} from '@/features/auth';
import { spacing, typography, createStyles, useTheme } from '@/theme';

interface SignUpScreenProps {
  onBack?: () => void;
  onSubmitPhone?: (values: CreateAccountPhoneValues) => void;
  onSubmitPassword?: (
    values: CreateAccountPasswordValues,
  ) => void | Promise<void>;
}

export const SignUpScreen = ({
  onBack,
  onSubmitPhone,
  onSubmitPassword,
}: SignUpScreenProps) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const showPassword = shouldRenderPasswordAuth();
  const showPhone = shouldRenderPhoneAuth();

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
            <PreviewThemeChip tone="light" />
          </View>

          <View style={styles.header}>
            <Text variant="title">{t('auth.signUpTitle')}</Text>
            <Text variant="subtitle" color={colors.textSecondary}>
              {t('auth.signUpSubtitle')}
            </Text>
          </View>

          <View style={styles.forms}>
            {showPassword ? (
              <CreateAccountPasswordForm onSubmit={onSubmitPassword} />
            ) : null}
            {showPhone ? (
              <CreateAccountPhoneForm onSubmit={onSubmitPhone} />
            ) : null}
          </View>

          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, spacing.screenBottom) },
            ]}
          >
            <Text style={styles.legal}>
              {t('auth.termsPrefix')}
              <Text style={styles.legalLink}>{t('auth.terms')}</Text>
              {t('auth.and')}
              <Text style={styles.legalLink}>{t('auth.privacy')}</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

/** @deprecated Use CreateAccountPhoneValues — kept for older imports. */
export type SignUpValues = CreateAccountPhoneValues;

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
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: 4,
    paddingTop: 10,
    gap: 5,
  },
  forms: {
    marginTop: 24,
    gap: 28,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 28,
    gap: 14,
  },
  legal: {
    textAlign: 'center',
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
    lineHeight: 18,
  },
  legalLink: {
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.link,
  },
}));
