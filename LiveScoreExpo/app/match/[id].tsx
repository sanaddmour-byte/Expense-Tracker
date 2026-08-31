import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StarButton } from '../../src/components/StarButton';
import { TeamLogo } from '../../src/components/TeamLogo';
import { findMatch, statisticsByMatchId } from '../../src/data/mockData';
import { useStarStore } from '../../src/store/StarStore';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme/theme';
import { MatchEvent, MatchStatistics, statusLabel } from '../../src/types/models';

const TABS = ['Timeline', 'Stats', 'H2H'] as const;
type Tab = (typeof TABS)[number];

const EVENT_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  goal: 'football',
  ownGoal: 'return-down-back',
  penaltyGoal: 'football',
  penaltyMissed: 'close-circle',
  yellowCard: 'square',
  redCard: 'square',
  secondYellowCard: 'square-half',
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
        {tab === 'Stats' && <StatsTab stats={stats} />}
        {tab === 'H2H' && <H2HTab />}
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

function H2HTab() {
  const { theme } = useAppTheme();
  return (
    <View style={styles.centeredPad}>
      <Text style={{ color: theme.textSecondary }}>No head-to-head data available.</Text>
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
});
