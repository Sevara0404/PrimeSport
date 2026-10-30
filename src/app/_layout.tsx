import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/theme';
import { initializeDatabase } from '@/db/schema';
import { AppStateProvider } from '@/lib/app-state';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="prime-sport.db" onInit={initializeDatabase}>
      <AppStateProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerTintColor: Colors.primary,
            headerTitleStyle: { color: Colors.text },
            headerStyle: { backgroundColor: Colors.surface },
            contentStyle: { backgroundColor: Colors.background },
            headerBackTitle: 'Back',
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Home' }} />
          <Stack.Screen name="event/[id]" options={{ title: 'Event' }} />
          <Stack.Screen name="profile" options={{ title: 'Profile' }} />
        </Stack>
      </AppStateProvider>
    </SQLiteProvider>
  );
}
