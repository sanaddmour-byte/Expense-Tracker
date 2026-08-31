import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MatchCard } from '../../src/components/MatchCard';
import { StarButton } from '../../src/components/StarButton';
import { TeamLogo } from '../../src/components/TeamLogo';
import { findMatch, teamProfile } from '../../src/data/mockData';
import { useStarStore } from '../../src/store/StarStore';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme/theme';
import { Match } from '../../src/types/models';

export default function TeamProfileScreen() {
  const { theme } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useMemo(() => teamProfile(Number(id)), [id]);
  const { isTeamStarred, isMatchStarred, toggleTeam, toggleMatch } = useStarStore();

  if (!profile) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textPrimary }}>Team not found.</Text>
      </View>
    );
  }

  const { team, competition, venue, squad } = profile;
  const upcoming = profile.upcomingFixtureIds.map(findMatch).filter((m): m is Match => Boolean(m));
  const recent = profile.recentResultIds.map(findMatch).filter((m): m is Match => Boolean(m));
  const starred = isTeamStarred(team.id);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen
        options={{
          title: team.name,
          headerRight: () => <StarButton starred={starred} onPress={() => toggleTeam(team, competition.name)} />,
        }}
      />

      <View style={styles.hero}>
        <TeamLogo team={team} size={72} />
        <Text style={[styles.teamName, { color: theme.textPrimary }]}>{team.name}</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{competition.name}</Text>
        {venue && <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{venue}</Text>}
      </View>

      {upcoming.length > 0 && (
        <Section title="Upcoming Fixtures">
          {upcoming.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              isTeamStarred={isTeamStarred}
              isMatchStarred={isMatchStarred(match.id)}
              onToggleStarMatch={() => toggleMatch(match)}
            />
          ))}
        </Section>
      )}

      {recent.length > 0 && (
        <Section title="Recent Results">
          {recent.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              isTeamStarred={isTeamStarred}
              isMatchStarred={isMatchStarred(match.id)}
              onToggleStarMatch={() => toggleMatch(match)}
            />
          ))}
        </Section>
      )}

      <Section title="Squad">
        <View style={[styles.squadCard, { backgroundColor: theme.card }]}>
          {squad.map((player, index) => (
            <View
              key={player.id}
              style={[
                styles.squadRow,
                index < squad.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider },
              ]}
            >
              <Text style={{ color: theme.pitchGreen, fontWeight: '700', width: 28 }}>{player.shirtNumber}</Text>
              <View>
                <Text style={{ color: theme.textPrimary, fontSize: 15 }}>{player.name}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{player.position}</Text>
              </View>
            </View>
          ))}
        </View>
      </Section>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xl },
  teamName: { fontSize: 22, fontWeight: '800' },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.sm },
  squadCard: { borderRadius: 12, overflow: 'hidden' },
  squadRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
});
