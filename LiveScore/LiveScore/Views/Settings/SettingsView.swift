import SwiftUI

struct SettingsView: View {
    @StateObject private var viewModel: SettingsViewModel

    init(viewModel: @autoclosure @escaping () -> SettingsViewModel) {
        _viewModel = StateObject(wrappedValue: viewModel())
    }

    var body: some View {
        NavigationStack {
            List {
                Section("Notifications") {
                    NavigationLink {
                        NotificationSettingsView(viewModel: viewModel)
                    } label: {
                        Label("Notification Preferences", systemImage: "bell.badge")
                    }
                }

                Section("Feed") {
                    NavigationLink {
                        LeaguePreferencesView(viewModel: viewModel)
                    } label: {
                        Label("Preferred Leagues", systemImage: "star.square")
                    }
                }

                Section("Appearance") {
                    Picker(selection: $viewModel.appearanceMode) {
                        ForEach(AppearanceMode.allCases) { mode in
                            Text(mode.title).tag(mode)
                        }
                    } label: {
                        Label("Theme", systemImage: "circle.lefthalf.filled")
                    }
                }

                Section("About") {
                    LabeledContent("Data Provider", value: AppConfig.useMockData ? "Mock Data" : "Football-Data.org")
                    LabeledContent("Version", value: appVersion)
                    Text("Live scores and match data provided by football-data.org. LiveScore is not affiliated with any football league, club, or governing body.")
                        .font(.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
            }
            .navigationTitle("Settings")
        }
    }

    private var appVersion: String {
        Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "1.0"
    }
}
