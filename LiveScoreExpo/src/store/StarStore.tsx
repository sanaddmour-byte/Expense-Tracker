import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Match, Team } from '../types/models';

const STORAGE_KEY = 'livescore.starred.v1';

export interface StarredTeam {
  teamId: number;
  teamName: string;
  competitionName: string;
  isMuted: boolean;
}

export interface StarredMatch {
  matchId: number;
  homeTeamName: string;
  awayTeamName: string;
  kickoff: string;
}

interface StarState {
  teams: StarredTeam[];
  matches: StarredMatch[];
}

interface StarStoreValue extends StarState {
  isTeamStarred: (teamId: number) => boolean;
  isMatchStarred: (matchId: number) => boolean;
  toggleTeam: (team: Team, competitionName: string) => void;
  toggleMatch: (match: Match) => void;
  toggleMute: (teamId: number) => void;
}

const StarStoreContext = createContext<StarStoreValue | undefined>(undefined);

export function StarStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StarState>({ teams: [], matches: [] });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState(JSON.parse(raw));
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, hydrated]);

  const value = useMemo<StarStoreValue>(
    () => ({
      ...state,
      isTeamStarred: (teamId) => state.teams.some((t) => t.teamId === teamId),
      isMatchStarred: (matchId) => state.matches.some((m) => m.matchId === matchId),
      toggleTeam: (team, competitionName) => {
        setState((prev) => {
          const exists = prev.teams.some((t) => t.teamId === team.id);
          return {
            ...prev,
            teams: exists
              ? prev.teams.filter((t) => t.teamId !== team.id)
              : [...prev.teams, { teamId: team.id, teamName: team.name, competitionName, isMuted: false }],
          };
        });
      },
      toggleMatch: (match) => {
        setState((prev) => {
          const exists = prev.matches.some((m) => m.matchId === match.id);
          return {
            ...prev,
            matches: exists
              ? prev.matches.filter((m) => m.matchId !== match.id)
              : [
                  ...prev.matches,
                  {
                    matchId: match.id,
                    homeTeamName: match.homeTeam.name,
                    awayTeamName: match.awayTeam.name,
                    kickoff: match.kickoff,
                  },
                ],
          };
        });
      },
      toggleMute: (teamId) => {
        setState((prev) => ({
          ...prev,
          teams: prev.teams.map((t) => (t.teamId === teamId ? { ...t, isMuted: !t.isMuted } : t)),
        }));
      },
    }),
    [state]
  );

  return <StarStoreContext.Provider value={value}>{children}</StarStoreContext.Provider>;
}

export function useStarStore(): StarStoreValue {
  const ctx = useContext(StarStoreContext);
  if (!ctx) throw new Error('useStarStore must be used within a StarStoreProvider');
  return ctx;
}
