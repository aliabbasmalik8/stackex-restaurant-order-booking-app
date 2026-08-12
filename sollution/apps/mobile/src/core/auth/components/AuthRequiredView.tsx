import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StateMessage } from '@/components/ui/StateMessage';
import { DEFAULT_POST_LOGIN_HREF } from '@/context/AuthContext';
import { createStyles, useTheme } from '@/theme';

type AuthRequiredViewProps = {
  /** Show spinner while auth session is resolving. */
  loading?: boolean;
  /** Override home href (defaults to menu tab). */
  homeHref?: string;
};

/**
 * Full-screen placeholder when a gated route is visible but the user is a guest.
 * Prefer with `useRequireAuthScreen({ redirectTo: null })` so the gate does not
 * bounce away before this can render.
 */
export function AuthRequiredView({
  loading = false,
  homeHref = DEFAULT_POST_LOGIN_HREF,
}: AuthRequiredViewProps) {
  useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StateMessage
        loading={loading}
        title={loading ? undefined : t('auth.screenRequiredTitle')}
        message={loading ? undefined : t('auth.screenRequiredSubtitle')}
        actionLabel={loading ? undefined : t('auth.goHome')}
        onAction={
          loading
            ? undefined
            : () => {
                router.replace(homeHref);
              }
        }
      />
    </View>
  );
}

const styles = createStyles((colors) => ({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
}));
