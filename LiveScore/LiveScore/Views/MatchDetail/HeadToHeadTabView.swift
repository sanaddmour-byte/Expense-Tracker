import SwiftUI

struct HeadToHeadTabView: View {
    let record: HeadToHeadRecord?
    let homeTeam: Team
    let awayTeam: Team

    var body: some View {
        if let record {
            VStack(spacing: Theme.Spacing.lg) {
                HStack(spacing: Theme.Spacing.xl) {
                    summaryColumn(value: record.homeWins, label: homeTeam.shortName)
                    summaryColumn(value: record.draws, label: "Draws")
                    summaryColumn(value: record.awayWins, label: awayTeam.shortName)
                }

                if record.recentMeetings.isEmpty {
                    EmptyStateView(symbol: "clock.arrow.circlepath", title: "No recent meetings", message: "These teams haven't played recently.")
                } else {
                    VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                        Text("Recent Meetings").font(.subheadline.weight(.semibold))
                        ForEach(record.recentMeetings) { match in
                            HStack {
                                Text("\(match.homeTeam.shortName) \(match.score.display) \(match.awayTeam.shortName)")
                                    .font(.subheadline)
                                Spacer()
                                Text(DateFormatting.fixtureDate.string(from: match.kickoff))
                                    .font(.caption)
                                    .foregroundStyle(Theme.Colors.textSecondary)
                            }
                        }
                    }
                }
            }
            .padding(Theme.Spacing.lg)
        } else {
            EmptyStateView(symbol: "arrow.left.arrow.right", title: "No head-to-head data", message: "Historical results aren't available yet.")
        }
    }

    private func summaryColumn(value: Int, label: String) -> some View {
        VStack {
            Text("\(value)").font(.title2.bold())
            Text(label).font(.caption).foregroundStyle(Theme.Colors.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }
}
