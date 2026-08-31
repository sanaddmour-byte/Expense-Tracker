# LiveScore (Expo / React Native)

Expo Router + React Native bootstrap of LiveScore, added alongside the native SwiftUI
app in `../LiveScore`. Same product (live football scores, starring, notification
preferences, team profiles) and the same green/yellow/white theme, built so it can be
previewed directly in a browser (`expo start --web`) without Xcode or an iOS simulator.

## Stack

- Expo SDK 57, Expo Router (file-based navigation), TypeScript
- React Context for theme (light/dark/system), starring, and settings, each persisted
  with `@react-native-async-storage/async-storage`
- Mock data only for now (`src/data/mockData.ts`) — no network layer yet

## Run it

```
npm install
npm run web      # browser preview at http://localhost:8081 (or expo start --web --port <n>)
npm run ios      # requires Xcode/macOS
npm run android  # requires Android Studio
```

## Structure

```
app/
  _layout.tsx              Root stack (theme + settings + star store providers)
  (tabs)/
    _layout.tsx             Bottom tab bar
    index.tsx               Live Scores feed (filters, search, grouped by competition)
    following.tsx           Starred teams (-> team profile) + their matches
    settings.tsx             Settings menu (notifications, leagues, appearance, about)
  match/[id].tsx             Match detail (scoreboard, timeline, lineups, stats, H2H)
  team/[id].tsx               Team profile (crest, fixtures, results, squad)
  settings/
    notifications.tsx         Notification event toggles + per-team mute
    leagues.tsx                Preferred-leagues picker (filters the main feed)
src/
  theme/                    Theme tokens + ThemeProvider
  types/models.ts           Match/Team/Competition/Lineup/H2H/Standing types + helpers
  data/mockData.ts           Sample matches/teams/squads/lineups/stats/H2H/standings
  store/
    StarStore.tsx             Starring state (Context + AsyncStorage)
    SettingsStore.tsx          Notification + preferred-league prefs (Context + AsyncStorage)
  components/                 MatchCard, FilterBar, StarButton, TeamLogo, EmptyState, etc.
```

## What's scaffolded vs. what's not (yet)

This is a preview-focused bootstrap, not full feature parity with the native app:

- ✅ Live scores feed: filters, search, grouping by competition, preferred-leagues declutter
- ✅ Match detail: scoreboard, timeline, lineups (pitch/formation view), stats bars, H2H
- ✅ Starring teams/matches, persisted locally, Following tab, per-team mute
- ✅ Team profile screen: fixtures, results, squad, star toggle
- ✅ Settings: notification event toggles, preferred leagues, light/dark/system theme
- ⏳ No live API integration yet (mock data only — mirrors the native app's
  `FootballAPIClient` abstraction conceptually but isn't wired up)
- ⏳ No push/local notifications yet (native app has a `NotificationTriggerEngine` +
  `BackgroundTasks` MVP; the toggles here are UI-only, not wired to an actual scheduler)
- ⏳ No unit tests yet

Data attribution: live match data, if/when wired up, would come from
[football-data.org](https://www.football-data.org).
