import Foundation

enum MatchStatus: String, Codable, Sendable {
    case scheduled
    case live
    case halfTime
    case finished
    case postponed
    case suspended
    case cancelled

    var isLive: Bool { self == .live || self == .halfTime }

    var displayLabel: String {
        switch self {
        case .scheduled: return "Scheduled"
        case .live: return "Live"
        case .halfTime: return "HT"
        case .finished: return "FT"
        case .postponed: return "Postponed"
        case .suspended: return "Suspended"
        case .cancelled: return "Cancelled"
        }
    }
}

struct Score: Hashable, Codable, Sendable {
    var home: Int
    var away: Int

    var display: String { "\(home) - \(away)" }
}

struct Match: Identifiable, Hashable, Codable, Sendable {
    let id: Int
    let competition: Competition
    let homeTeam: Team
    let awayTeam: Team
    var status: MatchStatus
    var score: Score
    /// Elapsed minute for live matches; nil when not applicable.
    var minute: Int?
    let kickoff: Date
    var events: [MatchEvent]

    var isLive: Bool { status.isLive }

    var statusText: String {
        switch status {
        case .live:
            return minute.map { "\($0)'" } ?? "Live"
        case .halfTime:
            return "HT"
        default:
            return status.displayLabel
        }
    }
}

extension Match {
    /// True if this match belongs to a given team, home or away.
    func involves(teamID: Int) -> Bool {
        homeTeam.id == teamID || awayTeam.id == teamID
    }
}

/// Which of the top-level feed filters/tabs a match belongs to, relative to "now".
enum MatchFeedFilter: String, CaseIterable, Identifiable, Sendable {
    case all = "All"
    case live = "Live"
    case today = "Today"
    case upcoming = "Upcoming"
    case finished = "Finished"

    var id: String { rawValue }

    func matches(_ match: Match, referenceDate: Date = Date()) -> Bool {
        let calendar = Calendar.current
        switch self {
        case .all:
            return true
        case .live:
            return match.isLive
        case .today:
            return calendar.isDate(match.kickoff, inSameDayAs: referenceDate)
        case .upcoming:
            return match.status == .scheduled && match.kickoff > referenceDate
        case .finished:
            return match.status == .finished
        }
    }
}
