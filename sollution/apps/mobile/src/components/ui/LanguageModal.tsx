import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/Text';
import { useLanguage } from '@/i18n/LanguageContext';
import { LOCALE_META, SUPPORTED_LOCALES, type AppLocale } from '@/i18n';
import { radii, spacing, typography, createStyles, useTheme } from '@/theme';

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LanguageModal = ({ visible, onClose }: LanguageModalProps) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { locale, setLocale } = useLanguage();

  const select = async (next: AppLocale) => {
    if (next === locale) {
      onClose();
      return;
    }
    onClose();
    await setLocale(next);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>{t('languages.title')}</Text>
          <Text style={styles.subtitle}>{t('languages.subtitle')}</Text>

          <View style={styles.list}>
            {SUPPORTED_LOCALES.map((code) => {
              const active = code === locale;
              const meta = LOCALE_META[code];
              return (
                <Pressable
                  key={code}
                  onPress={() => select(code)}
                  style={[styles.row, active && styles.rowActive]}
                >
                  <View style={styles.rowCopy}>
                    <Text
                      style={[styles.rowTitle, active && styles.rowTitleActive]}
                    >
                      {t(meta.nativeKey)}
                    </Text>
                    <Text style={styles.rowSub}>{t(meta.nameKey)}</Text>
                  </View>
                  <View style={[styles.radio, active && styles.radioOn]}>
                    {active ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={onClose} style={styles.done}>
            <Text style={styles.doneText}>{t('languages.done')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = createStyles((colors) => ({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(21,34,56,0.45)',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.screenX,
    paddingTop: 10,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 22,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
    marginBottom: 18,
  },
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  rowActive: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  rowCopy: { flex: 1, gap: 2 },
  rowTitle: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 15,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
  rowTitleActive: { color: colors.ink },
  rowSub: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  done: {
    marginTop: 18,
    height: 52,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 15,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.onPrimary,
  },
}));
