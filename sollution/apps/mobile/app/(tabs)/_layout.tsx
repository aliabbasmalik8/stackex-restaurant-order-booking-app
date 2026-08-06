import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { colors, typography } from '@/theme';

type TabIcon = keyof typeof Ionicons.glyphMap;

const TAB_META: Record<
  string,
  { labelKey: 'tabs.menu' | 'tabs.orders' | 'tabs.profile'; icon: TabIcon; iconOutline: TabIcon }
> = {
  menu: {
    labelKey: 'tabs.menu',
    icon: 'grid',
    iconOutline: 'grid-outline',
  },
  orders: {
    labelKey: 'tabs.orders',
    icon: 'time',
    iconOutline: 'time-outline',
  },
  profile: {
    labelKey: 'tabs.profile',
    icon: 'person-circle',
    iconOutline: 'person-circle-outline',
  },
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { requireAuth } = useAuth();

  return (
    <Tabs
      screenOptions={({ route }) => {
        const meta = TAB_META[route.name] ?? TAB_META.menu;
        return {
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: [
            styles.tabBar,
            {
              paddingBottom: Math.max(insets.bottom, 12),
              height: 58 + Math.max(insets.bottom, 12),
            },
          ],
          tabBarItemStyle: styles.item,
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconWrap}>
              <Ionicons
                name={focused ? meta.icon : meta.iconOutline}
                size={20}
                color={focused ? colors.link : colors.muted}
              />
              <Text
                style={[
                  styles.label,
                  { color: focused ? colors.link : colors.muted },
                ]}
              >
                {t(meta.labelKey)}
              </Text>
            </View>
          ),
        };
      }}
    >
      <Tabs.Screen name="menu" />
      <Tabs.Screen
        name="orders"
        listeners={{
          tabPress: (e) => {
            if (!requireAuth('/(tabs)/orders')) {
              e.preventDefault();
            }
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        listeners={{
          tabPress: (e) => {
            if (!requireAuth('/(tabs)/profile')) {
              e.preventDefault();
            }
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    borderTopWidth: 0,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
    paddingTop: 10,
  },
  item: {
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 10.5,
    fontWeight: typography.fontWeight.extrabold,
  },
});
