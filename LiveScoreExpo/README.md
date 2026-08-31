# LiveScore (Expo / React Native)

Expo Router + React Native bootstrap of LiveScore, added alongside the native SwiftUI
app in `../LiveScore`. Same product (live football scores, starring, notifications
settings) and the same green/yellow/white theme, built so it can be previewed directly
in a browser (`expo start --web`) without Xcode or an iOS simulator.

## Stack

- Expo SDK 57, Expo Router (file-based navigation), TypeScript
- React Context for theme (light/dark/system) and the starring store, persisted with
  `@react-native-async-storage/async-storage`
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
  _layout.tsx           Root stack (theme + star store providers)
  (tabs)/
    _layout.tsx          Bottom tab bar
    index.tsx            Live Scores feed (filters, search, grouped by competition)
    following.tsx        Starred teams + their matches
    settings.tsx          Notification prefs, appearance, about
  match/[id].tsx          Match detail (scoreboard, timeline, stats, H2H)
src/
  theme/                 Theme tokens + ThemeProvider
  types/models.ts        Match/Team/Competition/Event types + filter helpers
  data/mockData.ts        Sample matches/teams/stats
  store/StarStore.tsx      Starring state (Context + AsyncStorage)
  components/              MatchCard, FilterBar, StarButton, TeamLogo, etc.
```

## What's scaffolded vs. what's not (yet)

This is a preview-focused bootstrap, not full feature parity with the native app:

- ✅ Live scores feed, filters, search, grouping by competition
- ✅ Match detail: scoreboard, timeline, stats bars, tab navigation
- ✅ Starring teams/matches, persisted locally, Following tab
- ✅ Light/dark/system theme toggle
- ⏳ No live API integration yet (mock data only — mirrors the native app's
  `FootballAPIClient` abstraction conceptually but isn't wired up)
- ⏳ No push/local notifications yet (native app has a `NotificationTriggerEngine` +
  `BackgroundTasks` MVP; not ported here)
- ⏳ No lineups/head-to-head data, team profile screen, or unit tests yet

Data attribution: live match data, if/when wired up, would come from
[football-data.org](https://www.football-data.org).
