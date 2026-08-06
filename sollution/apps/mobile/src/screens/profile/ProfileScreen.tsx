import { useState, type ReactNode } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Toggle } from '@/components/ui';
import { PROFILE_USER } from '@/data/mockMenu';
import { colors, radii, spacing, typography } from '@/theme';

interface ProfileScreenProps {
  onSignOut?: () => void;
}

export const ProfileScreen = ({ onSignOut }: ProfileScreenProps) => {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(true);
  const remaining = PROFILE_USER.loyaltyGoal - PROFILE_USER.loyaltyStamps;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>Profile</Text>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{PROFILE_USER.initial}</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroName}>{PROFILE_USER.name}</Text>
            <Text style={styles.heroPhone}>{PROFILE_USER.phone}</Text>
          </View>
          <Text style={styles.edit}>Edit</Text>
        </View>

        <View style={styles.loyalty}>
          <View style={styles.loyaltyIcon}>
            <Text style={styles.star}>★</Text>
          </View>
          <View style={styles.loyaltyCopy}>
            <Text style={styles.loyaltyTitle}>
              Loyalty — {PROFILE_USER.loyaltyStamps} of{' '}
              {PROFILE_USER.loyaltyGoal} stamps
            </Text>
            <Text style={styles.loyaltySub}>
              {remaining} more orders until a free shawarma
            </Text>
          </View>
          <Text style={styles.loyaltyCount}>
            {PROFILE_USER.loyaltyStamps}/{PROFILE_USER.loyaltyGoal}
          </Text>
        </View>

        <View style={styles.group}>
          <Row icon="💳" label="Payment methods" />
          <Row
            icon="🌐"
            label="Language"
            trailing={
              <Text style={styles.linkText}>{PROFILE_USER.language}</Text>
            }
          />
          <View style={[styles.row, styles.rowLast]}>
            <View style={styles.rowIcon}>
              <Text style={styles.rowEmoji}>🔔</Text>
            </View>
            <Text style={styles.rowLabel}>Notifications</Text>
            <Toggle value={notifications} onValueChange={setNotifications} />
          </View>
        </View>

        <View style={styles.group}>
          <Row label="Help & support" muted />
          <Pressable onPress={onSignOut} style={[styles.row, styles.rowLast]}>
            <Text style={styles.signOut}>Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

const Row = ({
  icon,
  label,
  trailing,
  muted,
  last,
}: {
  icon?: string;
  label: string;
  trailing?: ReactNode;
  muted?: boolean;
  last?: boolean;
}) => (
  <Pressable style={[styles.row, last && styles.rowLast]}>
    {icon ? (
      <View style={styles.rowIcon}>
        <Text style={styles.rowEmoji}>{icon}</Text>
      </View>
    ) : null}
    <Text style={[styles.rowLabel, muted && styles.rowMuted]}>{label}</Text>
    {trailing ?? <Text style={styles.chevron}>›</Text>}
  </Pressable>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -0.4,
    color: colors.ink,
    paddingHorizontal: spacing.screenX,
  },
  body: {
    paddingHorizontal: spacing.screenX,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 14,
  },
  heroCard: {
    borderRadius: radii.xl,
    backgroundColor: colors.hero,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 19,
    fontWeight: typography.fontWeight.bold,
    color: colors.onHero,
  },
  heroCopy: { flex: 1, gap: 1 },
  heroName: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 16,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.onHero,
  },
  heroPhone: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12.5,
    fontWeight: typography.fontWeight.semibold,
    color: 'rgba(255,255,255,0.7)',
  },
  edit: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 12.5,
    fontWeight: typography.fontWeight.extrabold,
    color: 'rgba(255,255,255,0.9)',
  },
  loyalty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 14,
    paddingHorizontal: 17,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  loyaltyIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    fontSize: 16,
    color: colors.badgeText,
  },
  loyaltyCopy: { flex: 1, gap: 1 },
  loyaltyTitle: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
  loyaltySub: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
  },
  loyaltyCount: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 15,
    fontWeight: typography.fontWeight.bold,
    color: colors.price,
  },
  group: {
    borderRadius: radii.xl,
    backgroundColor: colors.card,
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 15,
    paddingHorizontal: 17,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowEmoji: { fontSize: 14 },
  rowLabel: {
    flex: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.ink,
  },
  rowMuted: { color: colors.sub },
  chevron: {
    fontSize: 18,
    color: colors.muted,
  },
  linkText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 12.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.link,
  },
  signOut: {
    flex: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.link,
  },
});
