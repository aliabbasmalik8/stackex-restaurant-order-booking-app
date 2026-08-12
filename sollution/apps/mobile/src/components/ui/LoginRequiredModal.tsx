import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/context/AuthContext';
import { radii, spacing, typography, createStyles, useTheme } from '@/theme';

/**
 * Minimal “sign in to continue” sheet for guests.
 * Primary CTA → login screen; redirect stays in AuthContext for after login.
 */
export function LoginRequiredModal() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { loginModalVisible, closeLoginModal } = useAuth();

  const goToLogin = () => {
    closeLoginModal();
    router.push('/');
  };

  return (
    <Modal
      visible={loginModalVisible}
      transparent
      animationType="slide"
      onRequestClose={closeLoginModal}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={closeLoginModal} />
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>{t('auth.loginRequiredTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.loginRequiredSubtitle')}</Text>

          <Button
            label={t('auth.loginRequiredCta')}
            onPress={goToLogin}
            style={styles.cta}
          />

          <Pressable
            accessibilityRole="button"
            onPress={closeLoginModal}
            style={styles.close}
          >
            <Text style={styles.closeText}>{t('common.close')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

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
    marginTop: 6,
    marginBottom: 20,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
    lineHeight: 20,
  },
  cta: {
    height: 52,
  },
  close: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 10,
  },
  closeText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.muted,
  },
}));
