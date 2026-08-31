import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useStarStore } from '../../src/store/StarStore';
import { NOTIFICATION_EVENTS, useSettingsStore } from '../../src/store/SettingsStore';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme/theme';

const EVENT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  kickoff: 'flag',
  goal: 'football',
  redCard: 'square',
  halfTime: 'pause-circle',
  fullTime: 'checkmark-done-circle',
};

export default function NotificationSettingsScreen() {
  const { theme } = useAppTheme();
  const { enabledEvents, toggleEvent } = useSettingsStore();
  const { teams, toggleMute } = useStarStore();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>EVENT TYPES</Text>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        {NOTIFICATION_EVENTS.map((event, index) => (
          <View
            key={event.key}
            style={[
              styles.row,
              index < NOTIFICATION_EVENTS.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: theme.divider,
              },
            ]}
          >
            <Ionicons name={EVENT_ICONS[event.key]} size={18} color={theme.pitchGreen} style={{ width: 24 }} />
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>{event.title}</Text>
            <Switch
              value={enabledEvents[event.key]}
              onValueChange={() => toggleEvent(event.key)}
              trackColor={{ true: theme.pitchGreen, false: theme.divider }}
            />
          </View>
        ))}
      </View>
      <Text style={[styles.footer, { color: theme.textSecondary }]}>
        Choose which match events trigger a notification for your starred teams and matches.
      </Text>

      {teams.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: spacing.xl }]}>
            PER-TEAM NOTIFICATIONS
          </Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {teams.map((team, index) => (
              <View
                key={team.teamId}
                style={[
                  styles.row,
                  index < teams.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider },
                ]}
              >
                <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>{team.teamName}</Text>
                <Switch
                  value={!team.isMuted}
                  onValueChange={() => toggleMute(team.teamId)}
                  trackColor={{ true: theme.pitchGreen, false: theme.divider }}
                />
              </View>
            ))}
          </View>
          <Text style={[styles.footer, { color: theme.textSecondary }]}>
            Mute a starred team to stop notifications for its matches without unstarring it.
          </Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  sectionTitle: { fontSize: 12, fontWeight: '700', marginBottom: spacing.sm, letterSpacing: 0.5 },
  card: { borderRadius: 12, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  rowLabel: { flex: 1, fontSize: 15 },
  footer: { fontSize: 12, marginTop: spacing.sm, lineHeight: 17 },
});
