import { Tabs } from 'expo-router/js-tabs';

import { Icon, type IconName } from '@/components/ui';
import { Colors } from '@/constants/theme';

const TABS: { name: string; title: string; icon: IconName; activeIcon: IconName }[] = [
  { name: 'profile', title: 'Profil', icon: 'account-outline', activeIcon: 'account' },
  { name: 'index', title: 'Bosh sahifa', icon: 'home-outline', activeIcon: 'home' },
  { name: 'events', title: 'Tadbirlar', icon: 'calendar-blank-outline', activeIcon: 'calendar-blank' },
  { name: 'map', title: 'Xarita', icon: 'map-outline', activeIcon: 'map' },
  { name: 'saved', title: 'Saqlangan', icon: 'bookmark-outline', activeIcon: 'bookmark' },
];

// Profil sits leftmost in the tab bar, but the app still opens on the home tab.
export const unstable_settings = { anchor: 'index' };

export default function TabLayout() {
  return (
    <Tabs
      backBehavior="initialRoute"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.border },
        tabBarLabelStyle: { fontWeight: '600' },
      }}>
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused, size }) => (
              <Icon name={focused ? tab.activeIcon : tab.icon} color={color as string} size={size} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
