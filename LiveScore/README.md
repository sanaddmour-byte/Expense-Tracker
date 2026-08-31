# LiveScore

A SwiftUI live football (soccer) scores app with starred teams/matches and notifications,
built as a standalone Xcode project inside this repository.

- Swift 5.9+, SwiftUI, iOS 17+
- MVVM with Combine + async/await, no completion-handler networking
- SwiftData for local persistence (starred teams, starred matches, settings)
- Protocol-based API client — ships with a bundled mock data provider so the whole app
  runs and is testable without any API key, plus a real client for
  [football-data.org](https://www.football-data.org)
- Local-notification MVP for the "push" requirement (see [Notifications](#notifications-mvp-vs-real-push))

## Project layout

```
LiveScore/
  LiveScore.xcodeproj/        Xcode project + shared scheme
  LiveScore/
    Config/                   AppConfig, ServiceContainer (DI), environment wiring
    Theme/                    Color/spacing/typography design tokens
    Models/                   Match, Team, Competition, events, stats, standings...
    Persistence/               SwiftData models (StarredTeam, StarredMatch, UserSettings)
    Services/
      API/                    FootballAPIClient protocol + mock + football-data.org client
      Notifications/          Local notification service, trigger engine, background task
      Polling/                Foreground live-match poller
    Repositories/             Thin façades over the services, injected into view models
    ViewModels/
    Views/                    LiveScores, MatchDetail, Following, TeamProfile, Settings
    Utilities/
  LiveScoreTests/              Unit tests (score parsing, starring, notification triggers)
  Configs/                     .xcconfig files (see below)
```

## Getting started

1. Open `LiveScore/LiveScore.xcodeproj` in Xcode 15+.
2. Select the **LiveScore** scheme and run on an iOS 17+ simulator or device.

That's it — with no API key configured, the app runs entirely on the bundled mock data
provider (`MockFootballAPIClient` / `MockData.swift`), so every screen (live scores,
match detail, lineups, stats, starring, notifications) is fully testable out of the box.

## Adding a real API key

The app talks to [football-data.org](https://www.football-data.org)'s free-tier REST API
by default when a key is present. To switch from mock to live data:

1. Register for a free API key at <https://www.football-data.org/client/register>.
2. Copy `Configs/Secrets.xcconfig.example` to `Configs/Secrets.xcconfig` (same folder).
   This file is gitignored and will never be committed.
3. Fill in your key:

   ```
   FOOTBALL_DATA_KEY = your_key_here
   ```

4. Rebuild. `AppConfig.useMockData` resolves to `false` automatically once a key is
   present (`DATA_SOURCE_MODE = AUTO`, the default). You can also force a mode explicitly
   in `Secrets.xcconfig`:

   ```
   DATA_SOURCE_MODE = MOCK   // always use mock data, even with a key present
   DATA_SOURCE_MODE = LIVE   // always use the live API (errors without a key)
   ```

Note: football-data.org's free tier doesn't expose lineups or possession/shots statistics
for most competitions — `FootballDataOrgClient` returns `nil` for those (the UI already
handles that as an empty state). The API client is fully abstracted behind
`FootballAPIClient` (`Services/API/FootballAPIClientProtocol.swift`), so swapping in
[API-Football](https://www.api-football.com/) or another provider — including one that
supplies lineups/stats — only requires a new conformance, no other code changes.

## Notifications (MVP vs. real push)

The task called for push notifications for starred teams/matches (kickoff, goals, red
cards, half-time, full-time). Without a backend to hold APNs device tokens and watch
live match state, this ships as a **local-notification MVP** structured so it's a
drop-in swap for real push later:

- `NotificationServiceProtocol` is the seam. `LocalNotificationService` (the current
  implementation) schedules local notifications via `UNUserNotificationCenter`. A future
  `RemotePushNotificationService` would conform to the same protocol and talk to your
  APNs backend instead — nothing else in the app would change.
- `NotificationTriggerEngine` is pure, dependency-free decision logic: given a match's
  previous and current snapshot plus the user's enabled event types, it decides which
  notifications should fire. This is unit tested and would be reused as-is by a server
  backend (e.g. ported to the serverless function that watches live matches).
- Two triggers feed the engine with fresh match data:
  - **Foreground**: `LiveMatchPoller` refreshes live matches every 20s while the app is
    open and forwards updates to `NotificationCoordinator`.
  - **Background**: `BackgroundTaskManager` registers a `BGAppRefreshTask`
    (`com.livescore.app.refresh`) that wakes the app periodically to do the same check,
    using the `BackgroundTasks` framework as requested. iOS decides exactly when this
    runs (typically not more than every ~15–30 minutes) — this is a best-effort MVP, not
    a guarantee of low-latency live alerts; real-time delivery needs server-triggered
    silent push.
- Notification permission is requested the first time the user stars a team or match
  (`requestAuthorizationIfNeeded()`), never on launch.
- Tapping a notification deep-links to the match via `NotificationRouter` →
  `RootTabView`, which presents `MatchDetailView` for that match.

### Enabling push notification capabilities in Xcode

The project already ships `LiveScore/LiveScore.entitlements` with
`aps-environment = development` and `UIBackgroundModes` (`fetch`, `remote-notification`,
`processing`) plus `BGTaskSchedulerPermittedIdentifiers` in `Info.plist`. To actually run
this on a real device (not just the simulator) and enable a real APNs backend later:

1. In Xcode, select the **LiveScore** target → **Signing & Capabilities**.
2. Set your **Team** (a free Apple ID works for local development/testing).
3. Confirm **Push Notifications** and **Background Modes** (Background fetch, Remote
   notifications, Background processing) are listed — Xcode will offer to add them
   automatically if it flags the entitlements/Info.plist as out of sync with your
   provisioning profile.
4. For a production APNs backend, change `aps-environment` to `production` in
   `LiveScore.entitlements` before archiving for release, and generate an APNs
   key/certificate in your Apple Developer account for your backend to use.

## Testing

`LiveScoreTests` covers:
- **Score parsing** — mapping football-data.org's raw JSON (status, score, goals,
  bookings, substitutions) into app models.
- **Starring/unstarring logic** — `StarringRepository` against an in-memory SwiftData
  store, including per-team mute and notification-eligibility rules.
- **Notification-trigger logic** — `NotificationTriggerEngine`'s decisions for kickoff/
  half-time/full-time transitions and goal/red-card events, including that starring a
  match already in progress doesn't replay its entire history as a notification storm.

Run via **Product → Test** (⌘U) in Xcode, or `xcodebuild test -scheme LiveScore
-destination 'platform=iOS Simulator,name=iPhone 15'`.

## Design system

`Theme.swift` centralizes colors, spacing, radii, shadows, and typography. Colors are
backed by `Assets.xcassets` (`PitchGreen`, `AccentYellow`, `CardBackground`,
`AccentColor`) with explicit light/dark variants — pitch green deepens and card
backgrounds go dark in Dark Mode, while the yellow accent stays vivid in both. Override
the system appearance from **Settings → Theme**.

## Data attribution

Live match data is provided by [football-data.org](https://www.football-data.org) under
their terms of use. LiveScore is not affiliated with any football league, club, or
governing body.
