export const palette = {
  pitchGreenLight: '#1B8A3D',
  pitchGreenDark: '#2FAE55',
  accentYellow: '#FFD400',
  liveRed: '#DC2626',
  white: '#FFFFFF',
  black: '#000000',
};

export const lightTheme = {
  mode: 'light' as const,
  pitchGreen: palette.pitchGreenLight,
  accentYellow: palette.accentYellow,
  liveRed: palette.liveRed,
  background: '#F2F3F5',
  card: '#FFFFFF',
  textPrimary: '#0B0B0C',
  textSecondary: '#6B7280',
  divider: '#E5E7EB',
  tabBarBackground: '#FFFFFF',
};

export const darkTheme = {
  mode: 'dark' as const,
  pitchGreen: palette.pitchGreenDark,
  accentYellow: palette.accentYellow,
  liveRed: '#F87171',
  background: '#0E0F10',
  card: '#1C1C1E',
  textPrimary: '#F5F5F7',
  textSecondary: '#9AA0A6',
  divider: '#2C2C2E',
  tabBarBackground: '#1C1C1E',
};

export type Theme = typeof lightTheme;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { card: 14, badge: 8, pill: 999 };
