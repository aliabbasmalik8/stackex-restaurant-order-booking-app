import { ActivityIndicator, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { UserAddressDto } from '@/api/OrderBooking/modules/addresses';
import { Button, Text } from '@/components/ui';
import { radii, typography, createStyles, useTheme } from '@/theme';

type AddressListProps = {
  addresses: UserAddressDto[];
  selectingId: string | null;
  deletingId: string | null;
  onSelect: (address: UserAddressDto) => void;
  onEdit: (address: UserAddressDto) => void;
  onDelete: (address: UserAddressDto) => void;
  onAdd: () => void;
};

function subtitle(address: UserAddressDto): string {
  const parts = [
    address.line1,
    address.line2,
    address.area,
    address.city,
  ].filter((part) => part?.trim());
  return parts.join(' · ');
}

export function AddressList({
  addresses,
  selectingId,
  deletingId,
  onSelect,
  onEdit,
  onDelete,
  onAdd,
}: AddressListProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const busyId = selectingId ?? deletingId;

  return (
    <View style={styles.root}>
      {addresses.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{t('menu.addressListEmpty')}</Text>
          <Text style={styles.emptyHint}>{t('menu.addressListEmptyHint')}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {addresses.map((address) => {
            const busy = busyId === address.id;
            return (
              <Pressable
                key={address.id}
                onPress={() => onSelect(address)}
                disabled={Boolean(busyId)}
                style={[
                  styles.row,
                  address.isDefault && styles.rowSelected,
                  busy && styles.rowBusy,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: address.isDefault, busy }}
              >
                <View style={styles.rowIcon}>
                  {busy ? (
                    <ActivityIndicator color={colors.ink} />
                  ) : (
                    <Ionicons
                      name={
                        address.isDefault
                          ? 'checkmark-circle'
                          : 'location-outline'
                      }
                      size={22}
                      color={
                        address.isDefault ? colors.primary : colors.muted
                      }
                    />
                  )}
                </View>
                <View style={styles.rowCopy}>
                  <View style={styles.rowTitleRow}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {address.label}
                    </Text>
                    {address.isDefault ? (
                      <Text style={styles.defaultBadge}>
                        {t('menu.addressDefault')}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.rowMeta} numberOfLines={2}>
                    {subtitle(address)}
                  </Text>
                </View>
                <View style={styles.rowActions}>
                  <Pressable
                    onPress={() => onEdit(address)}
                    disabled={Boolean(busyId)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={t('common.edit')}
                    style={styles.actionBtn}
                  >
                    <Ionicons
                      name="create-outline"
                      size={14}
                      color={colors.sub}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => onDelete(address)}
                    disabled={Boolean(busyId)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={t('common.delete')}
                    style={styles.actionBtn}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={14}
                      color={colors.muted}
                    />
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      <Button
        label={t('menu.addNewAddress')}
        onPress={onAdd}
        disabled={Boolean(busyId)}
      />
    </View>
  );
}

const styles = createStyles((colors) => ({
  root: {
    gap: 16,
  },
  empty: {
    paddingVertical: 28,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 16,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
    textAlign: 'center',
  },
  emptyHint: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
    textAlign: 'center',
    lineHeight: 18,
  },
  list: {
    gap: 10,
  },
  row: {
    minHeight: 72,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowSelected: {
    borderColor: colors.primary,
  },
  rowBusy: {
    opacity: 0.7,
  },
  rowIcon: {
    width: 28,
    alignItems: 'center',
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  rowTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowTitle: {
    flexShrink: 1,
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 15,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
  defaultBadge: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 10,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.primary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  rowMeta: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
    lineHeight: 18,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
