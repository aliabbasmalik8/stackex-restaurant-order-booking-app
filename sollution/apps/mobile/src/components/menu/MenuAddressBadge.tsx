import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import type { UserAddressDto } from '@/api/OrderBooking/modules/addresses';
import { radii, typography, createStyles, useTheme } from '@/theme';

type MenuAddressBadgeProps = {
  address?: UserAddressDto | null;
  onPress: () => void;
};

function badgeLabel(
  address: UserAddressDto | null | undefined,
  addLabel: string,
): string {
  if (!address) return addLabel;
  const area = address.area?.trim();
  if (area) return `${address.label} · ${area}`;
  return address.label.trim() || address.line1.trim() || addLabel;
}

export function MenuAddressBadge({ address, onPress }: MenuAddressBadgeProps) {
  useTheme();
  const { t } = useTranslation();
  const label = badgeLabel(address, t('menu.addAddress'));

  return (
    <Pressable
      onPress={onPress}
      style={styles.badge}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons
        name="location-outline"
        size={13}
        color="rgba(255,255,255,0.9)"
      />
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Ionicons
        name="chevron-down"
        size={12}
        color="rgba(255,255,255,0.75)"
      />
    </Pressable>
  );
}

const styles = createStyles(() => ({
  badge: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    height: 30,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    flexShrink: 1,
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 11.5,
    fontWeight: typography.fontWeight.extrabold,
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: 0.2,
  },
}));
