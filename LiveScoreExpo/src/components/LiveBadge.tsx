import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';
import { Match, statusLabel } from '../types/models';

export function StatusBadge({ match }: { match: Match }) {
  const { theme } = useAppTheme();

  if (match.status === 'live' || match.status === 'halfTime') {
    return (
      <View style={[styles.liveBadge, { backgroundColor: theme.liveRed }]}>
        <Text style={styles.liveText}>{statusLabel(match)}</Text>
      </View>
    );
  }

  return <Text style={[styles.plainText, { color: theme.textSecondary }]}>{statusLabel(match)}</Text>;
}

const styles = StyleSheet.create({
  liveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  plainText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
