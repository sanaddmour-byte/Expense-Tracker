import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SettingsStoreProvider } from '../src/store/SettingsStore';
import { StarStoreProvider } from '../src/store/StarStore';
import { ThemeProvider, useAppTheme } from '../src/theme/ThemeProvider';

function AppShell() {
  const { theme } = useAppTheme();
  return (
    <>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="match/[id]" options={{ headerShown: true, title: 'Match', presentation: 'card' }} />
        <Stack.Screen name="team/[id]" options={{ headerShown: true, title: 'Team', presentation: 'card' }} />
        <Stack.Screen
          name="settings/notifications"
          options={{ headerShown: true, title: 'Notifications', presentation: 'card' }}
        />
        <Stack.Screen
          name="settings/leagues"
          options={{ headerShown: true, title: 'Preferred Leagues', presentation: 'card' }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SettingsStoreProvider>
        <StarStoreProvider>
          <AppShell />
        </StarStoreProvider>
      </SettingsStoreProvider>
    </ThemeProvider>
  );
}
