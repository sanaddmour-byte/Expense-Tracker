import SwiftUI

struct ScoreboardHeaderView: View {
    let match: Match

    var body: some View {
        VStack(spacing: Theme.Spacing.md) {
            Text(match.competition.name)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.white.opacity(0.9))

            HStack(alignment: .center, spacing: Theme.Spacing.xl) {
                teamColumn(match.homeTeam)

                VStack(spacing: Theme.Spacing.xs) {
                    Text(match.score.display)
                        .font(.system(size: 34, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                    statusPill
                }

                teamColumn(match.awayTeam)
            }
        }
        .padding(Theme.Spacing.lg)
        .frame(maxWidth: .infinity)
        .background(Theme.Colors.pitchGreen)
    }

    private var statusPill: some View {
        Group {
            if match.isLive {
                Text(match.statusText)
                    .font(Theme.Typography.matchMinute)
                    .padding(.horizontal, Theme.Spacing.sm)
                    .padding(.vertical, 3)
                    .background(Theme.Colors.liveRed, in: Capsule())
                    .foregroundStyle(.white)
            } else {
                Text(match.status == .scheduled ? DateFormatting.kickoffTime.string(from: match.kickoff) : match.statusText)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.white.opacity(0.85))
            }
        }
    }

    private func teamColumn(_ team: Team) -> some View {
        VStack(spacing: Theme.Spacing.sm) {
            TeamLogoView(team: team, size: 48)
            Text(team.name)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.white)
                .multilineTextAlignment(.center)
                .lineLimit(2)
        }
        .frame(maxWidth: .infinity)
    }
}
