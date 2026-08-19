import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Text } from '@/components/ui';
import { EmptySearchIllustration } from './EmptySearchIllustration';
import { radii, spacing, typography, createStyles } from '@/theme';

type NoResultsStateProps = {
  searchQuery: string;
  onClear: () => void;
};

export const NoResultsState = ({
  searchQuery,
  onClear,
}: NoResultsStateProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.root}>
      <EmptySearchIllustration />
      <Text style={styles.title}>{t('menu.noResultsTitle')}</Text>
      <Text style={styles.message}>
        {t('menu.noResultsMessage', { query: searchQuery })}
      </Text>
      <Button
        label={t('menu.clearSearch')}
        onPress={onClear}
        style={styles.action}
      />
    </View>
  );
};

const styles = createStyles((colors) => ({
  root: {
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenX,
    paddingVertical: 64,
    gap: spacing.sm,
  },
  title: {
    marginTop: spacing.md,
    fontFamily: typography.fontFamilyDisplay,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.ink,
    textAlign: 'center',
  },
  message: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
    marginBottom: spacing.md,
  },
  action: {
    minWidth: 180,
    alignSelf: 'center',
    paddingHorizontal: 28,
    borderRadius: radii.xl,
  },
}));
