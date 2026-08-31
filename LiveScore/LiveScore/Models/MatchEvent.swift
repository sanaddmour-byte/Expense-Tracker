import Foundation

enum MatchEventType: String, Codable, Sendable {
    case goal
    case ownGoal
    case penaltyGoal
    case penaltyMissed
    case yellowCard
    case redCard
    case secondYellowCard
    case substitution
    case varReview
    case kickoff
    case halfTime
    case fullTime

    var sfSymbol: String {
        switch self {
        case .goal, .penaltyGoal: return "soccerball"
        case .ownGoal: return "arrow.uturn.backward.circle.fill"
        case .penaltyMissed: return "xmark.circle.fill"
        case .yellowCard: return "rectangle.fill"
        case .redCard: return "rectangle.fill"
        case .secondYellowCard: return "rectangle.2.swap"
        case .substitution: return "arrow.left.arrow.right"
        case .varReview: return "tv.badge.wifi"
        case .kickoff: return "flag.checkered"
        case .halfTime: return "pause.circle.fill"
        case .fullTime: return "checkmark.circle.fill"
        }
    }

    var displayName: String {
        switch self {
        case .goal: return "Goal"
        case .ownGoal: return "Own Goal"
        case .penaltyGoal: return "Penalty"
        case .penaltyMissed: return "Penalty Missed"
        case .yellowCard: return "Yellow Card"
        case .redCard: return "Red Card"
        case .secondYellowCard: return "Second Yellow"
        case .substitution: return "Substitution"
        case .varReview: return "VAR Review"
        case .kickoff: return "Kick Off"
        case .halfTime: return "Half Time"
        case .fullTime: return "Full Time"
        }
    }
}

struct MatchEvent: Identifiable, Hashable, Codable, Sendable {
    let id: String
    let type: MatchEventType
    let minute: Int
    let addedTime: Int?
    let teamID: Int?
    let playerName: String?
    let assistName: String?
    let detail: String?

    var displayMinute: String {
        if let addedTime, addedTime > 0 {
            return "\(minute)+\(addedTime)'"
        }
        return "\(minute)'"
    }
}
