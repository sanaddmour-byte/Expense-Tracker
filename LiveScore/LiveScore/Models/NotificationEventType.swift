import Foundation

/// The set of match events a user can be notified about. Backs both the global
/// notification-settings toggles and the per-notification-trigger logic.
enum NotificationEventType: String, CaseIterable, Codable, Identifiable, Sendable {
    case kickoff
    case goal
    case redCard
    case halfTime
    case fullTime

    var id: String { rawValue }

    var title: String {
        switch self {
        case .kickoff: return "Kickoff"
        case .goal: return "Goals"
        case .redCard: return "Red Cards"
        case .halfTime: return "Half-Time"
        case .fullTime: return "Full-Time / Final Score"
        }
    }

    var sfSymbol: String {
        switch self {
        case .kickoff: return "flag.checkered"
        case .goal: return "soccerball"
        case .redCard: return "rectangle.fill"
        case .halfTime: return "pause.circle.fill"
        case .fullTime: return "checkmark.seal.fill"
        }
    }

    static func matching(eventType: MatchEventType) -> NotificationEventType? {
        switch eventType {
        case .kickoff: return .kickoff
        case .goal, .penaltyGoal, .ownGoal: return .goal
        case .redCard, .secondYellowCard: return .redCard
        case .halfTime: return .halfTime
        case .fullTime: return .fullTime
        default: return nil
        }
    }
}
