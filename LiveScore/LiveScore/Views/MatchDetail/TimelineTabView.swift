import SwiftUI

struct TimelineTabView: View {
    let match: Match

    var body: some View {
        if match.events.isEmpty {
            EmptyStateView(symbol: "clock", title: "No events yet", message: "Match events will appear here as they happen.")
        } else {
            LazyVStack(spacing: 0) {
                ForEach(match.events.sorted(by: { $0.minute > $1.minute })) { event in
                    eventRow(event)
                    Divider().padding(.leading, 56)
                }
            }
        }
    }

    private func eventRow(_ event: MatchEvent) -> some View {
        let isHome = event.teamID == match.homeTeam.id

        return HStack {
            if isHome { eventContent(event, alignment: .trailing) }
            Spacer(minLength: Theme.Spacing.sm)

            VStack(spacing: 2) {
                Image(systemName: event.type.sfSymbol)
                    .foregroundStyle(iconColor(for: event.type))
                Text(event.displayMinute)
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(Theme.Colors.textSecondary)
            }
            .frame(width: 44)

            Spacer(minLength: Theme.Spacing.sm)
            if !isHome && event.teamID != nil { eventContent(event, alignment: .leading) }
            if event.teamID == nil { eventContent(event, alignment: .leading) }
        }
        .padding(.horizontal, Theme.Spacing.lg)
        .padding(.vertical, Theme.Spacing.sm)
    }

    private func eventContent(_ event: MatchEvent, alignment: HorizontalAlignment) -> some View {
        VStack(alignment: alignment, spacing: 2) {
            Text(event.playerName ?? event.type.displayName)
                .font(.subheadline.weight(.medium))
            if let assist = event.assistName {
                Text(event.type == .substitution ? "↔ \(assist)" : "Assist: \(assist)")
                    .font(.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
            } else if event.teamID == nil, let detail = event.detail {
                Text(detail)
                    .font(.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: alignment == .trailing ? .trailing : .leading)
    }

    private func iconColor(for type: MatchEventType) -> Color {
        switch type {
        case .goal, .penaltyGoal: return Theme.Colors.pitchGreen
        case .ownGoal, .penaltyMissed: return Theme.Colors.liveRed
        case .yellowCard: return Theme.Colors.accentYellow
        case .redCard, .secondYellowCard: return Theme.Colors.liveRed
        default: return Theme.Colors.textSecondary
        }
    }
}
