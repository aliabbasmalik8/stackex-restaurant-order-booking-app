import { View, ActivityIndicator, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { Text } from './Text';
import type { AppErrorCode } from '@/lib/errors';
import {
  errorMessageKey,
  errorTitleKey,
  getErrorMessage,
} from '@/lib/errors';
import { spacing, typography, createStyles, useTheme } from '@/theme';

type StateMessageProps = {
  loading?: boolean;
  errorCode?: AppErrorCode | null;
  /** Raw API / thrown error — prefers `user_error_detail` when present. */
  error?: unknown;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  compact?: boolean;
};

export const StateMessage = ({
  loading,
  errorCode,
  error,
  title,
  message,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  compact,
}: StateMessageProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const resolvedTitle =
    title ??
    (errorCode
      ? t(errorTitleKey(errorCode))
      : loading
        ? t('common.loading')
        : '');

  const i18nFallback = errorCode
    ? t(errorMessageKey(errorCode))
    : t('errors.unknown.message');

  const resolvedMessage =
    message ??
    (error != null
      ? getErrorMessage(error, i18nFallback)
      : errorCode
        ? i18nFallback
        : undefined);

  const resolvedAction =
    actionLabel ?? (errorCode && onAction ? t('common.retry') : undefined);

  return (
    <View style={[styles.root, compact && styles.compact]}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.price} />
      ) : errorCode ? (
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>!</Text>
        </View>
      ) : null}

      {resolvedTitle ? (
        <Text style={styles.title}>{resolvedTitle}</Text>
      ) : null}

      {resolvedMessage ? (
        <Text style={styles.message}>{resolvedMessage}</Text>
      ) : null}

      {resolvedAction && onAction ? (
        <View style={styles.actionWrap}>
          <Button
            label={resolvedAction}
            onPress={onAction}
            style={styles.action}
          />
        </View>
      ) : null}

      {secondaryLabel && onSecondary ? (
        <Pressable
          onPress={onSecondary}
          style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}
        >
          <Text style={styles.linkText}>{secondaryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = createStyles((colors) => ({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenX,
    paddingVertical: 40,
    gap: 12,
  },
  compact: {
    paddingVertical: 28,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  icon: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 24,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.badgeText,
  },
  title: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.ink,
    textAlign: 'center',
  },
  message: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  actionWrap: {
    marginTop: 8,
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
  },
  action: {
    minWidth: 180,
    alignSelf: 'center',
    paddingHorizontal: 28,
  },
  link: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  linkPressed: { opacity: 0.7 },
  linkText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.link,
  },
}));
