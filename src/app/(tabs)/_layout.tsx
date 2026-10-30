import { Tabs } from 'expo-router/js-tabs';

import { Icon, type IconName } from '@/components/ui';
import { Colors } from '@/constants/theme';

const TABS: { name: string; title: string; icon: IconName; activeIcon: IconName }[] = [
  { name: 'index', title: 'Bosh sahifa', icon: 'home-outline', activeIcon: 'home' },
  { name: 'events', title: 'Tadbirlar', icon: 'calendar-blank-outline', activeIcon: 'calendar-blank' },
  { name: 'map', title: 'Xarita', icon: 'map-outline', activeIcon: 'map' },
  { name: 'saved', title: 'Saqlangan', icon: 'bookmark-outline', activeIcon: 'bookmark' },
];

export default function TabLayout() {
  return (
    <Tabs
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
