import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { DimensionValue, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StarButton } from '../../src/components/StarButton';
import { TeamLogo } from '../../src/components/TeamLogo';
import { findMatch, headToHead, lineupsByMatchId, statisticsByMatchId } from '../../src/data/mockData';
import { useStarStore } from '../../src/store/StarStore';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme/theme';
import { LineupPlayer, Match, MatchEvent, MatchLineups, MatchStatistics, statusLabel, TeamLineup } from '../../src/types/models';

const TABS = ['Timeline', 'Lineups', 'Stats', 'H2H'] as const;
type Tab = (typeof TABS)[number];

const EVENT_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  goal: 'football',
  ownGoal: 'return-down-back',
  penaltyGoal: 'football',
  penaltyMissed: 'close-circle',
  yellowCard: 'square',
  redCard: 'square',
  secondYellowCard: 'alert-circle',
  substitution: 'swap-horizontal',
  varReview: 'tv',
  kickoff: 'flag',
  halfTime: 'pause-circle',
  fullTime: 'checkmark-circle',
};

export default function MatchDetailScreen() {
  const { theme } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const match = useMemo(() => findMatch(Number(id)), [id]);
  const { isMatchStarred, toggleMatch } = useStarStore();
  const [tab, setTab] = useState<Tab>('Timeline');

  if (!match) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textPrimary }}>Match not found.</Text>
      </View>
    );
  }

  const stats = statisticsByMatchId[match.id];
  const lineups = lineupsByMatchId[match.id];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen
        options={{
          title: `${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`,
          headerRight: () => <StarButton starred={isMatchStarred(match.id)} onPress={() => toggleMatch(match)} />,
        }}
      />
      <ScrollView>
        <View style={[styles.scoreboard, { backgroundColor: theme.pitchGreen }]}>
          <Text style={styles.competitionLabel}>{match.competition.name}</Text>
          <View style={styles.scoreRow}>
            <View style={styles.teamColumn}>
              <TeamLogo team={match.homeTeam} size={48} />
              <Text style={styles.teamName} numberOfLines={2}>
                {match.homeTeam.name}
              </Text>
            </View>
            <View style={styles.scoreCenter}>
              <Text style={styles.scoreText}>
                {match.score.home} - {match.score.away}
              </Text>
              <View style={[styles.statusPill, match.status === 'live' || match.status === 'halfTime' ? { backgroundColor: theme.liveRed } : null]}>
                <Text style={styles.statusText}>{statusLabel(match)}</Text>
              </View>
            </View>
            <View style={styles.teamColumn}>
              <TeamLogo team={match.awayTeam} size={48} />
              <Text style={styles.teamName} numberOfLines={2}>
                {match.awayTeam.name}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.tabBar}>
          {TABS.map((t) => (
            <Text
              key={t}
              onPress={() => setTab(t)}
              style={[
                styles.tabLabel,
                {
                  color: tab === t ? '#FFFFFF' : theme.textPrimary,
                  backgroundColor: tab === t ? theme.pitchGreen : theme.card,
                },
              ]}
            >
              {t}
            </Text>
          ))}
        </View>

        {tab === 'Timeline' && <TimelineTab events={match.events} homeTeamId={match.homeTeam.id} />}
        {tab === 'Lineups' && <LineupsTab lineups={lineups} match={match} />}
        {tab === 'Stats' && <StatsTab stats={stats} />}
        {tab === 'H2H' && <H2HTab match={match} />}
      </ScrollView>
    </View>
  );
}

function TimelineTab({ events, homeTeamId }: { events: MatchEvent[]; homeTeamId: number }) {
  const { theme } = useAppTheme();
  if (events.length === 0) {
    return (
      <View style={styles.centeredPad}>
        <Text style={{ color: theme.textSecondary }}>No events yet.</Text>
      </View>
    );
  }
  const sorted = [...events].sort((a, b) => b.minute - a.minute);
  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
      {sorted.map((event) => {
        const isHome = event.teamId === homeTeamId;
        return (
          <View key={event.id} style={styles.eventRow}>
            {event.teamId != null && isHome ? (
              <Text style={[styles.eventText, { color: theme.textPrimary, textAlign: 'right' }]}>
                {event.playerName ?? event.type}
              </Text>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <View style={styles.eventCenter}>
              <Ionicons name={EVENT_ICON[event.type] ?? 'ellipse'} size={16} color={theme.pitchGreen} />
              <Text style={[styles.eventMinute, { color: theme.textSecondary }]}>
                {event.addedTime ? `${event.minute}+${event.addedTime}'` : `${event.minute}'`}
              </Text>
            </View>
            {event.teamId != null && !isHome ? (
              <Text style={[styles.eventText, { color: theme.textPrimary }]}>{event.playerName ?? event.type}</Text>
            ) : (
              <View style={{ flex: 1 }} />
            )}
          </View>
        );
      })}
    </View>
  );
}

function StatsTab({ stats: s }: { stats: MatchStatistics | undefined }) {
  const { theme } = useAppTheme();

  if (!s) {
    return (
      <View style={styles.centeredPad}>
        <Text style={{ color: theme.textSecondary }}>Stats unavailable for this match.</Text>
      </View>
    );
  }

  const rows = [
    { label: 'Possession', home: s.possessionHome, away: s.possessionAway, pct: true },
    { label: 'Shots', home: s.shotsHome, away: s.shotsAway, pct: false },
    { label: 'Corners', home: s.cornersHome, away: s.cornersAway, pct: false },
  ];

  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.lg }}>
      {rows.map((row) => {
        const total = row.home + row.away || 1;
        const homeFraction = row.home / total;
        return (
          <View key={row.label}>
            <View style={styles.statHeader}>
              <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>
                {row.pct ? `${row.home}%` : row.home}
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{row.label}</Text>
              <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>
                {row.pct ? `${row.away}%` : row.away}
              </Text>
            </View>
            <View style={[styles.statBarTrack, { backgroundColor: theme.accentYellow }]}>
              <View style={[styles.statBarFill, { width: `${homeFraction * 100}%`, backgroundColor: theme.pitchGreen }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function LineupsTab({ lineups, match }: { lineups: MatchLineups | undefined; match: Match }) {
  const { theme } = useAppTheme();

  if (!lineups) {
    return (
      <View style={styles.centeredPad}>
        <Text style={{ color: theme.textSecondary }}>Lineups aren&apos;t published for this match yet.</Text>
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.lg }}>
      <View style={styles.formationHeader}>
        <View>
          <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{match.homeTeam.name}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{lineups.home.formation}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{match.awayTeam.name}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{lineups.away.formation}</Text>
        </View>
      </View>

      <View style={[styles.pitch, { backgroundColor: theme.pitchGreen }]}>
        <View style={styles.pitchHalfLine} />
        {lineups.home.startingXI.map((player) => (
          <PlayerDot key={`home-${player.id}`} player={player} flipped={false} />
        ))}
        {lineups.away.startingXI.map((player) => (
          <PlayerDot key={`away-${player.id}`} player={player} flipped />
        ))}
      </View>

      <BenchList title={`${match.homeTeam.name} Substitutes`} lineup={lineups.home} />
      <BenchList title={`${match.awayTeam.name} Substitutes`} lineup={lineups.away} />
    </View>
  );
}

function PlayerDot({ player, flipped }: { player: LineupPlayer; flipped: boolean }) {
  const { theme } = useAppTheme();
  const left: DimensionValue = `${(flipped ? 1 - player.position.x : player.position.x) * 100}%`;
  const top: DimensionValue = `${player.position.y * 100}%`;
  return (
    <View style={[styles.playerDot, { left, top }]}>
      <View style={styles.playerCircle}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: theme.pitchGreen }}>{player.shirtNumber}</Text>
      </View>
      {player.isCaptain && <Text style={{ fontSize: 8, fontWeight: '700', color: theme.accentYellow }}>C</Text>}
    </View>
  );
}

function BenchList({ title, lineup }: { title: string; lineup: TeamLineup }) {
  const { theme } = useAppTheme();
  return (
    <View>
      <Text style={{ color: theme.textPrimary, fontWeight: '600', marginBottom: spacing.sm }}>{title}</Text>
      {lineup.substitutes.map((player) => (
        <View key={player.id} style={styles.benchRow}>
          <Text style={{ color: theme.pitchGreen, fontWeight: '700', width: 28 }}>{player.shirtNumber}</Text>
          <Text style={{ color: theme.textPrimary }}>{player.name}</Text>
        </View>
      ))}
    </View>
  );
}

function H2HTab({ match }: { match: Match }) {
  const { theme } = useAppTheme();
  const record = headToHead(match.homeTeam.id, match.awayTeam.id);

  if (!record) {
    return (
      <View style={styles.centeredPad}>
        <Text style={{ color: theme.textSecondary }}>No head-to-head data available.</Text>
      </View>
    );
  }

  const recentMeetings = record.recentMeetingIds.map(findMatch).filter((m): m is Match => Boolean(m));

  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.lg }}>
      <View style={styles.h2hSummary}>
        <View style={styles.h2hColumn}>
          <Text style={[styles.h2hValue, { color: theme.textPrimary }]}>{record.homeWins}</Text>
          <Text style={[styles.h2hLabel, { color: theme.textSecondary }]}>{match.homeTeam.shortName}</Text>
        </View>
        <View style={styles.h2hColumn}>
          <Text style={[styles.h2hValue, { color: theme.textPrimary }]}>{record.draws}</Text>
          <Text style={[styles.h2hLabel, { color: theme.textSecondary }]}>Draws</Text>
        </View>
        <View style={styles.h2hColumn}>
          <Text style={[styles.h2hValue, { color: theme.textPrimary }]}>{record.awayWins}</Text>
          <Text style={[styles.h2hLabel, { color: theme.textSecondary }]}>{match.awayTeam.shortName}</Text>
        </View>
      </View>

      {recentMeetings.length > 0 && (
        <View>
          <Text style={{ color: theme.textPrimary, fontWeight: '600', marginBottom: spacing.sm }}>Recent Meetings</Text>
          {recentMeetings.map((m) => (
            <View key={m.id} style={styles.h2hMeetingRow}>
              <Text style={{ color: theme.textPrimary }}>
                {m.homeTeam.shortName} {m.score.home} - {m.score.away} {m.awayTeam.shortName}
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                {new Date(m.kickoff).toLocaleDateString([], { day: 'numeric', month: 'short' })}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centeredPad: { alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  scoreboard: { padding: spacing.lg, alignItems: 'center', gap: spacing.md },
  competitionLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  teamColumn: { flex: 1, alignItems: 'center', gap: spacing.sm },
  teamName: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  scoreCenter: { alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg },
  scoreText: { color: '#FFFFFF', fontSize: 32, fontWeight: '800' },
  statusPill: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 999 },
  statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  tabBar: { flexDirection: 'row', gap: spacing.sm, padding: spacing.lg },
  tabLabel: { flex: 1, textAlign: 'center', paddingVertical: spacing.sm, borderRadius: 10, fontWeight: '600', overflow: 'hidden' },
  eventRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  eventText: { flex: 1, fontSize: 14, fontWeight: '500' },
  eventCenter: { alignItems: 'center', width: 56, gap: 2 },
  eventMinute: { fontSize: 11, fontWeight: '600' },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  statBarTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  statBarFill: { height: 6 },
  formationHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  pitch: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  pitchHalfLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  playerDot: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -13 }, { translateY: -13 }],
  },
  playerCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  h2hSummary: { flexDirection: 'row', justifyContent: 'space-around' },
  h2hColumn: { alignItems: 'center', gap: 2 },
  h2hValue: { fontSize: 22, fontWeight: '800' },
  h2hLabel: { fontSize: 12 },
  h2hMeetingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
});
