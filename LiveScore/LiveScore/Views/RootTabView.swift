import SwiftUI
import SwiftData

struct RootTabView: View {
    @Environment(\.services) private var services
    @EnvironmentObject private var notificationRouter: NotificationRouter
    @StateObject private var settingsViewModel: SettingsViewModel
    @State private var selectedTab: Tab = .liveScores
    @State private var deepLinkedMatch: Match?

    enum Tab {
        case liveScores, following, settings
    }

    /// `modelContainer` is passed explicitly (rather than read from `\.services` via
    /// `@Environment`) because environment values aren't resolved yet inside `init()`,
    /// and `SettingsViewModel` needs a live `ModelContext` to construct.
    init(modelContainer: ModelContainer) {
        _settingsViewModel = StateObject(wrappedValue: SettingsViewModel(context: modelContainer.mainContext))
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            LiveScoresView(viewModel: LiveScoresViewModel(matchRepository: services.matchRepository, poller: services.liveMatchPoller))
                .tabItem { Label("Live Scores", systemImage: "sportscourt.fill") }
                .tag(Tab.liveScores)

            FollowingView(viewModel: FollowingViewModel(matchRepository: services.matchRepository))
                .tabItem { Label("Following", systemImage: "star.fill") }
                .tag(Tab.following)

            SettingsView(viewModel: settingsViewModel)
                .tabItem { Label("Settings", systemImage: "gearshape.fill") }
                .tag(Tab.settings)
        }
        .tint(Theme.Colors.pitchGreen)
        .preferredColorScheme(colorScheme)
        .onChange(of: notificationRouter.pendingMatchID) { _, matchID in
            guard let matchID else { return }
            selectedTab = .liveScores
            Task {
                if let match = try? await services.matchRepository.match(id: matchID) {
                    deepLinkedMatch = match
                }
            }
            notificationRouter.pendingMatchID = nil
        }
        .sheet(item: $deepLinkedMatch) { match in
            NavigationStack {
                MatchDetailView(viewModel: MatchDetailViewModel(match: match, matchRepository: services.matchRepository))
                    .toolbar {
                        ToolbarItem(placement: .navigationBarLeading) {
                            Button("Close") { deepLinkedMatch = nil }
                        }
                    }
            }
        }
    }

    private var colorScheme: ColorScheme? {
        switch settingsViewModel.appearanceMode {
        case .system: return nil
        case .light: return .light
        case .dark: return .dark
        }
    }
}
