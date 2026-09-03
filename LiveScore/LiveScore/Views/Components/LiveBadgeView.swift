import SwiftUI

struct LiveBadgeView: View {
    let text: String

    var body: some View {
        Text(text)
            .font(Theme.Typography.matchMinute)
            .foregroundStyle(.white)
            .padding(.horizontal, Theme.Spacing.sm)
            .padding(.vertical, 3)
            .background(Theme.Colors.liveRed, in: Capsule())
    }
}

struct StatusBadgeView: View {
    let match: Match

    var body: some View {
        switch match.status {
        case .live, .halfTime:
            LiveBadgeView(text: match.statusText)
        case .scheduled:
            Text(DateFormatting.kickoffTime.string(from: match.kickoff))
                .font(Theme.Typography.matchMinute)
                .foregroundStyle(Theme.Colors.textSecondary)
        case .finished:
            Text("FT")
                .font(Theme.Typography.matchMinute)
                .foregroundStyle(Theme.Colors.textSecondary)
        case .postponed, .suspended, .cancelled:
            Text(match.status.displayLabel)
                .font(Theme.Typography.matchMinute)
                .foregroundStyle(Theme.Colors.textSecondary)
        }
    }
}
