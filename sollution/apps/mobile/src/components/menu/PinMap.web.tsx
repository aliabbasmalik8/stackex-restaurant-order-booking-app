import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { typography, createStyles, useTheme } from '@/theme';

/** Web placeholder until OSM map is wired. */
export function PinMap() {
  useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.root}>
      <Text style={styles.message}>{t('menu.mapPreviewUnavailable')}</Text>
    </View>
  );
}

const styles = createStyles((colors) => ({
  root: {
    flex: 1,
    minHeight: 220,
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  message: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
    textAlign: 'center',
  },
}));
