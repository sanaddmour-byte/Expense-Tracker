import SwiftUI
import SwiftData

struct MatchDetailView: View {
    @StateObject var viewModel: MatchDetailViewModel
    @Query private var starredMatches: [StarredMatch]
    @Environment(\.modelContext) private var modelContext

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                ScoreboardHeaderView(match: viewModel.match)

                Picker("Tab", selection: $viewModel.selectedTab) {
                    ForEach(MatchDetailViewModel.Tab.allCases) { tab in
                        Text(tab.rawValue).tag(tab)
                    }
                }
                .pickerStyle(.segmented)
                .padding(Theme.Spacing.lg)

                tabContent
            }
        }
        .background(Theme.Colors.background)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                StarButton(isStarred: isStarred, action: toggleStar)
            }
        }
        .onAppear { viewModel.onAppear() }
        .onDisappear { viewModel.onDisappear() }
    }

    @ViewBuilder
    private var tabContent: some View {
        if viewModel.isLoadingDetails && viewModel.statistics == nil && viewModel.lineups == nil {
            LoadingView(message: "Loading match details...")
                .frame(minHeight: 200)
        } else {
            switch viewModel.selectedTab {
            case .timeline:
                TimelineTabView(match: viewModel.match)
            case .lineups:
                LineupsTabView(lineups: viewModel.lineups, homeTeam: viewModel.match.homeTeam, awayTeam: viewModel.match.awayTeam)
            case .stats:
                StatsTabView(statistics: viewModel.statistics, homeTeam: viewModel.match.homeTeam, awayTeam: viewModel.match.awayTeam)
            case .h2h:
                HeadToHeadTabView(record: viewModel.headToHead, homeTeam: viewModel.match.homeTeam, awayTeam: viewModel.match.awayTeam)
            }
        }
    }

    private var isStarred: Bool {
        starredMatches.contains { $0.matchID == viewModel.match.id }
    }

    private func toggleStar() {
        let repository = StarringRepository(context: modelContext)
        if isStarred {
            repository.unstarMatch(viewModel.match.id)
        } else {
            repository.starMatch(viewModel.match)
        }
    }
}
