import SwiftUI

struct CompetitionSectionView: View {
    let competition: Competition
    let matches: [Match]
    let isTeamStarred: (Int) -> Bool
    let isMatchStarred: (Int) -> Bool
    let onToggleStarMatch: (Match) -> Void
    let onSelectMatch: (Match) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            HStack(spacing: Theme.Spacing.xs) {
                Text(competition.name)
                    .font(Theme.Typography.competitionHeader)
                Text(competition.country)
                    .font(.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }
            .padding(.horizontal, Theme.Spacing.xs)

            ForEach(matches) { match in
                Button {
                    onSelectMatch(match)
                } label: {
                    MatchCardView(
                        match: match,
                        isTeamStarred: isTeamStarred,
                        isMatchStarred: isMatchStarred(match.id),
                        onToggleStarMatch: { onToggleStarMatch(match) }
                    )
                }
                .buttonStyle(.plain)
            }
        }
    }
}
