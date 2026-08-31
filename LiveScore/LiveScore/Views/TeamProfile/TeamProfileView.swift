import SwiftUI
import SwiftData

struct TeamProfileView: View {
    @StateObject var viewModel: TeamProfileViewModel
    @Query private var starredTeams: [StarredTeam]
    @Environment(\.modelContext) private var modelContext
    @Environment(\.services) private var services

    var body: some View {
        Group {
            switch viewModel.state {
            case .loading:
                LoadingView(message: "Loading team...")
            case .error(let message):
                ErrorRetryView(message: message) { Task { await viewModel.load() } }
            case .loaded:
                if let profile = viewModel.profile {
                    profileContent(profile)
                }
            }
        }
        .navigationTitle(viewModel.profile?.team.name ?? "Team")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if let profile = viewModel.profile {
                ToolbarItem(placement: .navigationBarTrailing) {
                    StarButton(isStarred: isStarred(profile.team.id)) { toggleStar(profile) }
                }
            }
        }
        .task { await viewModel.load() }
    }

    private func profileContent(_ profile: TeamProfile) -> some View {
        ScrollView {
            VStack(spacing: Theme.Spacing.lg) {
                VStack(spacing: Theme.Spacing.sm) {
                    TeamLogoView(team: profile.team, size: 72)
                    Text(profile.team.name).font(.title2.bold())
                    Text(profile.competition.name)
                        .font(.subheadline)
                        .foregroundStyle(Theme.Colors.textSecondary)
                    if let venue = profile.team.venue {
                        Text(venue).font(.caption).foregroundStyle(Theme.Colors.textSecondary)
                    }
                }
                .padding(.top, Theme.Spacing.lg)

                section(title: "Upcoming Fixtures", matches: profile.upcomingFixtures)
                section(title: "Recent Results", matches: profile.recentResults)
                squadSection(profile.squad)
            }
            .padding(.bottom, Theme.Spacing.xl)
        }
        .background(Theme.Colors.background)
    }

    private func section(title: String, matches: [Match]) -> some View {
        Group {
            if !matches.isEmpty {
                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    Text(title).font(.headline).padding(.horizontal, Theme.Spacing.lg)
                    ForEach(matches) { match in
                        MatchCardView(
                            match: match,
                            isTeamStarred: { teamID in starredTeams.contains { $0.teamID == teamID } },
                            isMatchStarred: false,
                            onToggleStarMatch: {}
                        )
                        .padding(.horizontal, Theme.Spacing.lg)
                    }
                }
            }
        }
    }

    private func squadSection(_ squad: [SquadPlayer]) -> some View {
        Group {
            if !squad.isEmpty {
                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    Text("Squad").font(.headline).padding(.horizontal, Theme.Spacing.lg)
                    VStack(spacing: 0) {
                        ForEach(squad) { player in
                            HStack {
                                Text(player.shirtNumber.map { "\($0)" } ?? "-")
                                    .font(.caption.weight(.bold))
                                    .foregroundStyle(Theme.Colors.pitchGreen)
                                    .frame(width: 28)
                                VStack(alignment: .leading) {
                                    Text(player.name).font(.subheadline)
                                    Text(player.position).font(.caption).foregroundStyle(Theme.Colors.textSecondary)
                                }
                                Spacer()
                            }
                            .padding(.vertical, Theme.Spacing.sm)
                            .padding(.horizontal, Theme.Spacing.lg)
                            Divider().padding(.leading, Theme.Spacing.lg)
                        }
                    }
                    .cardStyle()
                    .padding(.horizontal, Theme.Spacing.lg)
                }
            }
        }
    }

    private func isStarred(_ teamID: Int) -> Bool {
        starredTeams.contains { $0.teamID == teamID }
    }

    private func toggleStar(_ profile: TeamProfile) {
        let repository = StarringRepository(context: modelContext)
        if isStarred(profile.team.id) {
            repository.unstarTeam(profile.team.id)
        } else {
            repository.starTeam(profile.team, competition: profile.competition)
            Task { await services.notificationService.requestAuthorizationIfNeeded() }
        }
    }
}
