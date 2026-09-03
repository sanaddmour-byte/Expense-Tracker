import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/theme';
import { FEED_FILTERS, FeedFilter } from '../types/models';

export function FilterBar({ selected, onSelect }: { selected: FeedFilter; onSelect: (f: FeedFilter) => void }) {
  const { theme } = useAppTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {FEED_FILTERS.map((filter) => {
        const active = filter === selected;
        return (
          <Pressable
            key={filter}
            onPress={() => onSelect(filter)}
            style={[
              styles.chip,
              { backgroundColor: active ? theme.pitchGreen : theme.card },
            ]}
          >
            <Text style={[styles.label, { color: active ? '#FFFFFF' : theme.textPrimary }]}>{filter}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
