import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme/theme';

const MODES = ['system', 'light', 'dark'] as const;

export default function SettingsScreen() {
  const { theme, mode, setMode } = useAppTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.pitchGreen }]}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>NOTIFICATIONS</Text>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <MenuRow
            icon="notifications"
            label="Notification Preferences"
            onPress={() => router.push('/settings/notifications')}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: spacing.xl }]}>FEED</Text>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <MenuRow icon="star-half" label="Preferred Leagues" onPress={() => router.push('/settings/leagues')} />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: spacing.xl }]}>APPEARANCE</Text>
        <View style={[styles.card, { backgroundColor: theme.card, flexDirection: 'row', padding: spacing.xs }]}>
          {MODES.map((m) => {
            const active = mode === m;
            return (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                style={[styles.modeButton, { backgroundColor: active ? theme.pitchGreen : 'transparent' }]}
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

function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Ionicons name={icon} size={18} color={theme.pitchGreen} style={{ width: 24 }} />
      <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
    </Pressable>
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
