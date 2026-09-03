import SwiftUI
import SwiftData

struct LiveScoresView: View {
    @StateObject private var viewModel: LiveScoresViewModel
    @Query(sort: \StarredTeam.dateAdded) private var starredTeams: [StarredTeam]
    @Query(sort: \StarredMatch.kickoff) private var starredMatches: [StarredMatch]
    @Environment(\.modelContext) private var modelContext
    @Environment(\.services) private var services
    @State private var selectedMatch: Match?

    init(viewModel: @autoclosure @escaping () -> LiveScoresViewModel) {
        _viewModel = StateObject(wrappedValue: viewModel())
    }

    var body: some View {
        NavigationStack {
            content
                .navigationTitle("LiveScore")
                .matchSearchable(text: $viewModel.searchText)
                .navigationDestination(item: $selectedMatch) { match in
                    MatchDetailView(viewModel: MatchDetailViewModel(match: match, matchRepository: services.matchRepository))
                }
        }
        .onAppear { viewModel.onAppear() }
        .onDisappear { viewModel.onDisappear() }
    }

    @ViewBuilder
    private var content: some View {
        switch viewModel.state {
        case .loading:
            LoadingView(message: "Loading today's matches...")
        case .error(let message):
            ErrorRetryView(message: message) { Task { await viewModel.refresh() } }
        case .loaded:
            if viewModel.groupedMatches.isEmpty {
                EmptyStateView(symbol: "sportscourt", title: "No matches", message: "No matches found for this filter.")
            } else {
                matchList
            }
        }
    }

    private var matchList: some View {
        ScrollView {
            FilterBarView(selected: $viewModel.selectedFilter)
                .padding(.vertical, Theme.Spacing.sm)

            LazyVStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                ForEach(viewModel.groupedMatches, id: \.competition.id) { group in
                    CompetitionSectionView(
                        competition: group.competition,
                        matches: group.matches,
                        isTeamStarred: { teamID in starredTeams.contains { $0.teamID == teamID } },
                        isMatchStarred: { matchID in starredMatches.contains { $0.matchID == matchID } },
                        onToggleStarMatch: toggleStarMatch,
                        onSelectMatch: { selectedMatch = $0 }
                    )
                }
            }
            .padding(.horizontal, Theme.Spacing.lg)
            .padding(.bottom, Theme.Spacing.xl)
        }
        .refreshable { await viewModel.refresh() }
    }

    private func toggleStarMatch(_ match: Match) {
        let repository = StarringRepository(context: modelContext)
        if repository.isMatchStarred(match.id) {
            repository.unstarMatch(match.id)
        } else {
            repository.starMatch(match)
            Task { await services.notificationService.requestAuthorizationIfNeeded() }
        }
    }
}
