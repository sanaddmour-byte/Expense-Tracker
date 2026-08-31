import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../src/components/EmptyState';
import { MatchCard } from '../../src/components/MatchCard';
import { matches as allMatches } from '../../src/data/mockData';
import { useStarStore } from '../../src/store/StarStore';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme/theme';

export default function FollowingScreen() {
  const { theme } = useAppTheme();
  const { teams, matches: starredMatches, isTeamStarred, isMatchStarred, toggleMatch, toggleMute } = useStarStore();

  const followedMatches = useMemo(() => {
    const teamIds = new Set(teams.map((t) => t.teamId));
    const matchIds = new Set(starredMatches.map((m) => m.matchId));
    return allMatches
      .filter((m) => matchIds.has(m.id) || teamIds.has(m.homeTeam.id) || teamIds.has(m.awayTeam.id))
      .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
  }, [teams, starredMatches]);

  const isEmpty = teams.length === 0 && starredMatches.length === 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.pitchGreen }]}>
        <Text style={styles.headerTitle}>Following</Text>
      </View>

      {isEmpty ? (
        <EmptyState
          icon="star-outline"
          title="Nothing followed yet"
          message="Star a team or match from Live Scores to see it here."
        />
      ) : (
        <View style={styles.content}>
          {teams.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Starred Teams</Text>
              {teams.map((team) => (
                <View key={team.teamId} style={[styles.teamRow, { backgroundColor: theme.card }]}>
                  <Text style={[styles.teamName, { color: theme.textPrimary }]}>{team.teamName}</Text>
                  <Text style={[styles.teamCompetition, { color: theme.textSecondary }]}>{team.competitionName}</Text>
                  <Ionicons
                    name={team.isMuted ? 'notifications-off' : 'notifications'}
                    size={18}
                    color={team.isMuted ? theme.textSecondary : theme.pitchGreen}
                    onPress={() => toggleMute(team.teamId)}
                  />
                </View>
              ))}
            </View>
          )}

          {followedMatches.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Upcoming &amp; Live</Text>
              {followedMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  isTeamStarred={isTeamStarred}
                  isMatchStarred={isMatchStarred(match.id)}
                  onToggleStarMatch={() => toggleMatch(match)}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: spacing.lg },
  section: { marginTop: spacing.lg },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: spacing.sm, textTransform: 'uppercase' },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  teamName: { fontSize: 15, fontWeight: '500', flex: 1 },
  teamCompetition: { fontSize: 12 },
});
