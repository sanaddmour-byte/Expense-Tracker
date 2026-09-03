import SwiftUI

struct MatchCardView: View {
    let match: Match
    let isTeamStarred: (Int) -> Bool
    let isMatchStarred: Bool
    let onToggleStarMatch: () -> Void

    var body: some View {
        HStack(spacing: Theme.Spacing.md) {
            VStack(spacing: Theme.Spacing.sm) {
                teamRow(team: match.homeTeam, score: match.score.home)
                teamRow(team: match.awayTeam, score: match.score.away)
            }

            Spacer()

            VStack(spacing: Theme.Spacing.xs) {
                StatusBadgeView(match: match)
            }

            StarButton(isStarred: isMatchStarred, action: onToggleStarMatch)
        }
        .padding(Theme.Spacing.md)
        .cardStyle()
    }

    private func teamRow(team: Team, score: Int) -> some View {
        HStack(spacing: Theme.Spacing.sm) {
            TeamLogoView(team: team, size: 24)
            Text(team.name)
                .font(Theme.Typography.teamName)
                .lineLimit(1)
            if isTeamStarred(team.id) {
                Image(systemName: "star.fill")
                    .font(.caption2)
                    .foregroundStyle(Theme.Colors.accentYellow)
            }
            Spacer(minLength: Theme.Spacing.sm)
            if match.status != .scheduled {
                Text("\(score)")
                    .font(Theme.Typography.score)
                    .monospacedDigit()
            }
        }
    }
}

#Preview {
    MatchCardView(
        match: MockData.matches[0],
        isTeamStarred: { _ in true },
        isMatchStarred: false,
        onToggleStarMatch: {}
    )
    .padding()
}
