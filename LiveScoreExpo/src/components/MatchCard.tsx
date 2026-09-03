import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/theme';
import { Match, Team } from '../types/models';
import { StatusBadge } from './LiveBadge';
import { StarButton } from './StarButton';
import { TeamLogo } from './TeamLogo';

export function MatchCard({
  match,
  isTeamStarred,
  isMatchStarred,
  onToggleStarMatch,
}: {
  match: Match;
  isTeamStarred: (teamId: number) => boolean;
  isMatchStarred: boolean;
  onToggleStarMatch: () => void;
}) {
  const { theme } = useAppTheme();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/match/${match.id}`)}
      style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.mode === 'dark' ? '#000' : '#0B0B0C' }]}
    >
      <View style={styles.teamsColumn}>
        <TeamRow team={match.homeTeam} score={match.score.home} match={match} isTeamStarred={isTeamStarred} />
        <TeamRow team={match.awayTeam} score={match.score.away} match={match} isTeamStarred={isTeamStarred} />
      </View>
      <View style={styles.statusColumn}>
        <StatusBadge match={match} />
      </View>
      <StarButton starred={isMatchStarred} onPress={onToggleStarMatch} />
    </Pressable>
  );
}

function TeamRow({
  team,
  score,
  match,
  isTeamStarred,
}: {
  team: Team;
  score: number;
  match: Match;
  isTeamStarred: (teamId: number) => boolean;
}) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.teamRow}>
      <TeamLogo team={team} size={22} />
      <Text numberOfLines={1} style={[styles.teamName, { color: theme.textPrimary }]}>
        {team.name}
      </Text>
      {isTeamStarred(team.id) && (
        <Text style={{ color: theme.accentYellow, fontSize: 11 }}> ★</Text>
      )}
      {match.status !== 'scheduled' && (
        <Text style={[styles.score, { color: theme.textPrimary }]}>{score}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  teamsColumn: {
    flex: 1,
    gap: spacing.sm,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  teamName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  score: {
    fontSize: 17,
    fontWeight: '700',
    minWidth: 18,
    textAlign: 'right',
  },
  statusColumn: {
    minWidth: 48,
    alignItems: 'center',
  },
});
