import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Switch, Text, View } from 'react-native';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme/theme';

const EVENT_TYPES = [
  { key: 'kickoff', title: 'Kickoff', icon: 'flag' as const },
  { key: 'goal', title: 'Goals', icon: 'football' as const },
  { key: 'redCard', title: 'Red Cards', icon: 'square' as const },
  { key: 'halfTime', title: 'Half-Time', icon: 'pause-circle' as const },
  { key: 'fullTime', title: 'Full-Time / Final Score', icon: 'checkmark-done-circle' as const },
];

const MODES = ['system', 'light', 'dark'] as const;

export default function SettingsScreen() {
  const { theme, mode, setMode } = useAppTheme();
  const [enabledEvents, setEnabledEvents] = useState<Record<string, boolean>>(
    Object.fromEntries(EVENT_TYPES.map((e) => [e.key, true]))
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.pitchGreen }]}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>NOTIFICATIONS</Text>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          {EVENT_TYPES.map((event, index) => (
            <View
              key={event.key}
              style={[
                styles.row,
                index < EVENT_TYPES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider },
              ]}
            >
              <Ionicons name={event.icon} size={18} color={theme.pitchGreen} style={{ width: 24 }} />
              <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>{event.title}</Text>
              <Switch
                value={enabledEvents[event.key]}
                onValueChange={(v) => setEnabledEvents((prev) => ({ ...prev, [event.key]: v }))}
                trackColor={{ true: theme.pitchGreen, false: theme.divider }}
              />
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: spacing.xl }]}>APPEARANCE</Text>
        <View style={[styles.card, { backgroundColor: theme.card, flexDirection: 'row', padding: spacing.xs }]}>
          {MODES.map((m) => {
            const active = mode === m;
            return (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                style={[
                  styles.modeButton,
                  { backgroundColor: active ? theme.pitchGreen : 'transparent' },
                ]}
              >
                <Text style={{ color: active ? '#FFFFFF' : theme.textPrimary, fontWeight: '600', fontSize: 13 }}>
                  {m[0].toUpperCase() + m.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: spacing.xl }]}>ABOUT</Text>
        <View style={[styles.card, { backgroundColor: theme.card, padding: spacing.md }]}>
          <Text style={[styles.rowLabel, { color: theme.textPrimary, marginBottom: spacing.xs }]}>
            Data Provider: Mock Data
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12, lineHeight: 18 }}>
            Live match data provided by football-data.org. LiveScore is not affiliated with any football league,
            club, or governing body.
          </Text>
        </View>
      </View>
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
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
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
  modeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 10,
  },
});
