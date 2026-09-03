import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'livescore.settings.v1';

export type NotificationEventKey = 'kickoff' | 'goal' | 'redCard' | 'halfTime' | 'fullTime';

export const NOTIFICATION_EVENTS: { key: NotificationEventKey; title: string }[] = [
  { key: 'kickoff', title: 'Kickoff' },
  { key: 'goal', title: 'Goals' },
  { key: 'redCard', title: 'Red Cards' },
  { key: 'halfTime', title: 'Half-Time' },
  { key: 'fullTime', title: 'Full-Time / Final Score' },
];

interface SettingsState {
  enabledEvents: Record<NotificationEventKey, boolean>;
  /** Empty = show all competitions. */
  preferredCompetitionIds: number[];
}

const defaultState: SettingsState = {
  enabledEvents: { kickoff: true, goal: true, redCard: true, halfTime: true, fullTime: true },
  preferredCompetitionIds: [],
};

interface SettingsStoreValue extends SettingsState {
  toggleEvent: (key: NotificationEventKey) => void;
  toggleCompetition: (competitionId: number) => void;
  isCompetitionPreferred: (competitionId: number) => boolean;
}

const SettingsContext = createContext<SettingsStoreValue | undefined>(undefined);

export function SettingsStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SettingsState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState({ ...defaultState, ...JSON.parse(raw) });
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, hydrated]);

  const value = useMemo<SettingsStoreValue>(
    () => ({
      ...state,
      toggleEvent: (key) =>
        setState((prev) => ({ ...prev, enabledEvents: { ...prev.enabledEvents, [key]: !prev.enabledEvents[key] } })),
      toggleCompetition: (competitionId) =>
        setState((prev) => {
          const exists = prev.preferredCompetitionIds.includes(competitionId);
          return {
            ...prev,
            preferredCompetitionIds: exists
              ? prev.preferredCompetitionIds.filter((id) => id !== competitionId)
              : [...prev.preferredCompetitionIds, competitionId],
          };
        }),
      isCompetitionPreferred: (competitionId) =>
        state.preferredCompetitionIds.length === 0 || state.preferredCompetitionIds.includes(competitionId),
    }),
    [state]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettingsStore(): SettingsStoreValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettingsStore must be used within a SettingsStoreProvider');
  return ctx;
}
