import SwiftUI

struct LeaguePreferencesView: View {
    @ObservedObject var viewModel: SettingsViewModel
    @Environment(\.services) private var services
    @State private var competitions: [Competition] = []
    @State private var isLoading = true

    var body: some View {
        List {
            Section {
                if isLoading {
                    ProgressView()
                } else {
                    ForEach(competitions) { competition in
                        Button {
                            viewModel.togglePreferredCompetition(competition.id)
                        } label: {
                            HStack {
                                Text(competition.name)
                                    .foregroundStyle(Theme.Colors.textPrimary)
                                Spacer()
                                if viewModel.isPreferredCompetition(competition.id) {
                                    Image(systemName: "checkmark")
                                        .foregroundStyle(Theme.Colors.pitchGreen)
                                }
                            }
                        }
                    }
                }
            } footer: {
                Text("Select the leagues you care about to declutter the main feed. Leave all unselected to show everything.")
            }
        }
        .navigationTitle("Preferred Leagues")
        .task {
            competitions = (try? await services.matchRepository.competitions()) ?? []
            isLoading = false
        }
    }
}
