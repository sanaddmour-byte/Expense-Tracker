import SwiftUI

struct StatsTabView: View {
    let statistics: MatchStatistics?
    let homeTeam: Team
    let awayTeam: Team

    var body: some View {
        if let statistics {
            VStack(spacing: Theme.Spacing.lg) {
                ForEach(statistics.rows, id: \.label) { row in
                    statRow(row)
                }
            }
            .padding(Theme.Spacing.lg)
        } else {
            EmptyStateView(symbol: "chart.bar", title: "Stats unavailable", message: "Match statistics aren't published for this match yet.")
        }
    }

    private func statRow(_ row: MatchStatistics.Pair) -> some View {
        let total = max(row.home + row.away, 1)
        let homeFraction = row.home / total

        return VStack(spacing: Theme.Spacing.xs) {
            HStack {
                Text(valueText(row.home, isPercentage: row.isPercentage))
                    .font(.subheadline.weight(.semibold))
                Spacer()
                Text(row.label)
                    .font(.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
                Spacer()
                Text(valueText(row.away, isPercentage: row.isPercentage))
                    .font(.subheadline.weight(.semibold))
            }

            GeometryReader { geometry in
                HStack(spacing: 2) {
                    Rectangle()
                        .fill(Theme.Colors.pitchGreen)
                        .frame(width: geometry.size.width * homeFraction)
                    Rectangle()
                        .fill(Theme.Colors.accentYellow)
                }
            }
            .frame(height: 6)
            .clipShape(Capsule())
        }
    }

    private func valueText(_ value: Double, isPercentage: Bool) -> String {
        isPercentage ? "\(Int(value))%" : "\(Int(value))"
    }
}
