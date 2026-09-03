import React, { useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { EmptyState } from '../../src/components/EmptyState';
import { FilterBar } from '../../src/components/FilterBar';
import { MatchCard } from '../../src/components/MatchCard';
import { matches as allMatches } from '../../src/data/mockData';
import { useSettingsStore } from '../../src/store/SettingsStore';
import { useStarStore } from '../../src/store/StarStore';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme/theme';
import { Competition, FeedFilter, Match, matchesFilter } from '../../src/types/models';

function groupByCompetition(matches: Match[]): { competition: Competition; matches: Match[] }[] {
  const order: number[] = [];
  const buckets: Record<number, { competition: Competition; matches: Match[] }> = {};
  for (const match of matches) {
    if (!buckets[match.competition.id]) {
      order.push(match.competition.id);
      buckets[match.competition.id] = { competition: match.competition, matches: [] };
    }
    buckets[match.competition.id].matches.push(match);
  }
  return order.map((id) => buckets[id]);
}

export default function LiveScoresScreen() {
  const { theme } = useAppTheme();
  const { isTeamStarred, isMatchStarred, toggleMatch } = useStarStore();
  const { isCompetitionPreferred } = useSettingsStore();
  const [filter, setFilter] = useState<FeedFilter>('All');
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    return allMatches
      .filter((m) => isCompetitionPreferred(m.competition.id))
      .filter((m) => matchesFilter(m, filter))
      .filter((m) =>
        query.trim().length === 0
          ? true
          : `${m.homeTeam.name} ${m.awayTeam.name} ${m.competition.name}`
              .toLowerCase()
              .includes(query.trim().toLowerCase())
      );
  }, [filter, query, isCompetitionPreferred]);

  const grouped = useMemo(() => groupByCompetition(filtered), [filtered]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.pitchGreen }]}>
        <Text style={styles.headerTitle}>LiveScore</Text>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: theme.card }]}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search teams or competitions"
          placeholderTextColor={theme.textSecondary}
          style={[styles.searchInput, { color: theme.textPrimary }]}
        />
      </View>

      <FilterBar selected={filter} onSelect={setFilter} />

      {grouped.length === 0 ? (
        <EmptyState icon="football-outline" title="No matches" message="No matches found for this filter." />
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(g) => String(g.competition.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.pitchGreen} />}
          renderItem={({ item }) => (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{item.competition.name}</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>{item.competition.country}</Text>
              </View>
              {item.matches.map((match) => (
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
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  searchWrap: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    height: 40,
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
  },
});
