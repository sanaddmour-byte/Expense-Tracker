import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, Theme } from './theme';

export type AppearanceMode = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  mode: AppearanceMode;
  setMode: (mode: AppearanceMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<AppearanceMode>('system');

  const resolvedDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const theme = resolvedDark ? darkTheme : lightTheme;

  const value = useMemo(() => ({ theme, mode, setMode }), [theme, mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within a ThemeProvider');
  return ctx;
}
