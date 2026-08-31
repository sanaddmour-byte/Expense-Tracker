import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
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
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <StarStoreProvider>
        <AppShell />
      </StarStoreProvider>
    </ThemeProvider>
  );
}
