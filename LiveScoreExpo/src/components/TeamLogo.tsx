import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';
import { Team } from '../types/models';

export function TeamLogo({ team, size = 28 }: { team: Team; size?: number }) {
  const { theme } = useAppTheme();
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.pitchGreen + '26',
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.34, color: theme.pitchGreen }]}>
        {team.shortName.slice(0, 3)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
  },
});
