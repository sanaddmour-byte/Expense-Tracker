import SwiftUI
import SwiftData

struct NotificationSettingsView: View {
    @ObservedObject var viewModel: SettingsViewModel
    @Query(sort: \StarredTeam.dateAdded) private var starredTeams: [StarredTeam]
    @Environment(\.modelContext) private var modelContext

    var body: some View {
        List {
            Section {
                ForEach(NotificationEventType.allCases) { event in
                    Toggle(isOn: Binding(
                        get: { viewModel.isEventEnabled(event) },
                        set: { _ in viewModel.toggleEvent(event) }
                    )) {
                        Label(event.title, systemImage: event.sfSymbol)
                    }
                    .tint(Theme.Colors.pitchGreen)
                }
            } header: {
                Text("Event Types")
            } footer: {
                Text("Choose which match events trigger a notification for your starred teams and matches.")
            }

            if !starredTeams.isEmpty {
                Section {
                    ForEach(starredTeams) { team in
                        Toggle(isOn: Binding(
                            get: { !team.isMuted },
                            set: { _ in toggleMute(team) }
                        )) {
                            Text(team.teamName)
                        }
                        .tint(Theme.Colors.pitchGreen)
                    }
                } header: {
                    Text("Per-Team Notifications")
                } footer: {
                    Text("Mute a starred team to stop notifications for its matches without unstarring it.")
                }
            }
        }
        .navigationTitle("Notifications")
    }

    private func toggleMute(_ team: StarredTeam) {
        StarringRepository(context: modelContext).toggleTeamMute(team.teamID)
    }
}
