import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { championsLeague, laLiga, premierLeague } from '../../src/data/mockData';
import { useSettingsStore } from '../../src/store/SettingsStore';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme/theme';

const ALL_COMPETITIONS = [premierLeague, laLiga, championsLeague];

export default function LeaguePreferencesScreen() {
  const { theme } = useAppTheme();
  const { isCompetitionPreferred, toggleCompetition, preferredCompetitionIds } = useSettingsStore();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.content}>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        {ALL_COMPETITIONS.map((competition, index) => {
          const selected = isCompetitionPreferred(competition.id) && preferredCompetitionIds.length > 0;
          return (
            <Pressable
              key={competition.id}
              onPress={() => toggleCompetition(competition.id)}
              style={[
                styles.row,
                index < ALL_COMPETITIONS.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.divider,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.textPrimary, fontSize: 15 }}>{competition.name}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{competition.country}</Text>
              </View>
              {selected && <Ionicons name="checkmark" size={20} color={theme.pitchGreen} />}
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.footer, { color: theme.textSecondary }]}>
        Select the leagues you care about to declutter the main feed. Leave all unselected to show everything.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  card: { borderRadius: 12, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  footer: { fontSize: 12, marginTop: spacing.sm, lineHeight: 17 },
});
