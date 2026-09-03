import SwiftUI
import SwiftData

struct FollowingView: View {
    @StateObject private var viewModel: FollowingViewModel
    @Query(sort: \StarredTeam.dateAdded) private var starredTeams: [StarredTeam]
    @Query(sort: \StarredMatch.kickoff) private var starredMatches: [StarredMatch]
    @Environment(\.modelContext) private var modelContext
    @Environment(\.services) private var services
    @State private var selectedMatch: Match?

    init(viewModel: @autoclosure @escaping () -> FollowingViewModel) {
        _viewModel = StateObject(wrappedValue: viewModel())
    }

    var body: some View {
        NavigationStack {
            content
                .navigationTitle("Following")
                .navigationDestination(item: $selectedMatch) { match in
                    MatchDetailView(viewModel: MatchDetailViewModel(match: match, matchRepository: services.matchRepository))
                }
                .navigationDestination(for: Int.self) { teamID in
                    TeamProfileView(viewModel: TeamProfileViewModel(teamID: teamID, matchRepository: services.matchRepository))
                }
        }
        .task { await viewModel.load() }
        .refreshable { await viewModel.load() }
    }

    @ViewBuilder
    private var content: some View {
        if starredTeams.isEmpty && starredMatches.isEmpty {
            EmptyStateView(
                symbol: "star",
                title: "Nothing followed yet",
                message: "Star a team or match from the Live Scores tab to see it here."
            )
        } else {
            let followed = viewModel.followedMatches(
                starredTeamIDs: Set(starredTeams.map(\.teamID)),
                starredMatchIDs: Set(starredMatches.map(\.matchID))
            )

            List {
                if !starredTeams.isEmpty {
                    Section("Starred Teams") {
                        ForEach(starredTeams) { team in
                            starredTeamRow(team)
                        }
                        .onDelete(perform: unstarTeams)
                    }
                }

                if !followed.isEmpty {
                    Section("Upcoming & Live") {
                        ForEach(followed) { match in
                            Button { selectedMatch = match } label: {
                                MatchCardView(
                                    match: match,
                                    isTeamStarred: { teamID in starredTeams.contains { $0.teamID == teamID } },
                                    isMatchStarred: starredMatches.contains { $0.matchID == match.id },
                                    onToggleStarMatch: { toggleStarMatch(match) }
                                )
                            }
                            .buttonStyle(.plain)
                            .listRowInsets(EdgeInsets())
                            .listRowSeparator(.hidden)
                            .padding(.vertical, Theme.Spacing.xs)
                        }
                    }
                }
            }
            .listStyle(.plain)
        }
    }

    private func starredTeamRow(_ team: StarredTeam) -> some View {
        NavigationLink(value: team.teamID) {
            HStack {
                Text(team.teamName).font(.subheadline.weight(.medium))
                Spacer()
                Text(team.competitionName).font(.caption).foregroundStyle(Theme.Colors.textSecondary)
                if team.isMuted {
                    Image(systemName: "bell.slash.fill").foregroundStyle(Theme.Colors.textSecondary)
                }
            }
        }
    }

    private func unstarTeams(at offsets: IndexSet) {
        let repository = StarringRepository(context: modelContext)
        for index in offsets {
            repository.unstarTeam(starredTeams[index].teamID)
        }
    }

    private func toggleStarMatch(_ match: Match) {
        let repository = StarringRepository(context: modelContext)
        if repository.isMatchStarred(match.id) {
            repository.unstarMatch(match.id)
        } else {
            repository.starMatch(match)
        }
    }
}
