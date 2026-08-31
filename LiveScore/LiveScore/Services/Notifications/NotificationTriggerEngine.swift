import Foundation

/// Pure, testable decision logic: given a match's previous and current snapshot plus the
/// user's notification preferences, decides which local notifications (if any) should fire.
/// Deliberately has no dependency on UNUserNotificationCenter or SwiftData so it can be
/// unit tested in isolation.
struct NotificationTriggerEngine {
    let enabledEvents: Set<NotificationEventType>

    /// - Parameters:
    ///   - previous: The last snapshot we evaluated for this match, or nil if this is the
    ///     first time we've seen it (in which case only "new since kickoff" events fire,
    ///     never a backlog of every historical event).
    ///   - current: The latest fetched snapshot.
    ///   - isEligible: Whether this match is starred, or belongs to a starred+unmuted team.
    func notifications(previous: Match?, current: Match, isEligible: Bool) -> [PendingNotification] {
        guard isEligible else { return [] }

        var results: [PendingNotification] = []

        if shouldNotifyStatusTransition(from: previous?.status, to: current.status, type: .live) {
            results.append(kickoffNotification(for: current))
        }
        if shouldNotifyStatusTransition(from: previous?.status, to: current.status, type: .halfTime) {
            results.append(halfTimeNotification(for: current))
        }
        if shouldNotifyStatusTransition(from: previous?.status, to: current.status, type: .finished) {
            results.append(fullTimeNotification(for: current))
        }

        let previousEventIDs = Set((previous?.events ?? []).map(\.id))
        let newEvents = current.events.filter { !previousEventIDs.contains($0.id) }
        // On first sighting of a match, only surface events that happen from here on —
        // otherwise starring a match already in progress would replay its entire history.
        let eventsToConsider = previous == nil ? [] : newEvents

        for event in eventsToConsider {
            guard let mappedType = NotificationEventType.matching(eventType: event.type),
                  enabledEvents.contains(mappedType),
                  let kind = EventNotificationKind(mappedType) else { continue }
            results.append(eventNotification(for: event, in: current, kind: kind))
        }

        return results
    }

    private func shouldNotifyStatusTransition(from previousStatus: MatchStatus?, to newStatus: MatchStatus, type: MatchStatus) -> Bool {
        // `previousStatus == nil` means this is the first time we've ever seen this match
        // (e.g. the user just starred a team mid-match) — never replay a historical
        // transition in that case, only react to changes going forward.
        guard let previousStatus, newStatus == type, previousStatus != type else { return false }
        let mapped: NotificationEventType? = {
            switch type {
            case .live: return .kickoff
            case .halfTime: return .halfTime
            case .finished: return .fullTime
            default: return nil
            }
        }()
        guard let mapped, enabledEvents.contains(mapped) else { return false }
        // Only fire kickoff when transitioning from "scheduled", not from some other state.
        if type == .live { return previousStatus == .scheduled }
        return true
    }

    private func kickoffNotification(for match: Match) -> PendingNotification {
        PendingNotification(
            identifier: "\(match.id)-kickoff",
            matchID: match.id,
            eventType: .kickoff,
            title: "Kickoff!",
            body: "\(match.homeTeam.name) vs \(match.awayTeam.name) has kicked off."
        )
    }

    private func halfTimeNotification(for match: Match) -> PendingNotification {
        PendingNotification(
            identifier: "\(match.id)-halftime",
            matchID: match.id,
            eventType: .halfTime,
            title: "Half-Time",
            body: "\(match.homeTeam.name) \(match.score.display) \(match.awayTeam.name)"
        )
    }

    private func fullTimeNotification(for match: Match) -> PendingNotification {
        PendingNotification(
            identifier: "\(match.id)-fulltime",
            matchID: match.id,
            eventType: .fullTime,
            title: "Full-Time",
            body: "\(match.homeTeam.name) \(match.score.display) \(match.awayTeam.name) — Final Score"
        )
    }

    private func eventNotification(for event: MatchEvent, in match: Match, kind: EventNotificationKind) -> PendingNotification {
        let teamName = [match.homeTeam, match.awayTeam].first { $0.id == event.teamID }?.name ?? ""
        switch kind {
        case .goal:
            let scorer = event.playerName.map { " — \($0)" } ?? ""
            return PendingNotification(
                identifier: "\(match.id)-event-\(event.id)",
                matchID: match.id,
                eventType: .goal,
                title: "Goal! \(teamName)",
                body: "\(match.homeTeam.name) \(match.score.display) \(match.awayTeam.name)\(scorer)"
            )
        case .redCard:
            let player = event.playerName ?? "A player"
            return PendingNotification(
                identifier: "\(match.id)-event-\(event.id)",
                matchID: match.id,
                eventType: .redCard,
                title: "Red Card — \(teamName)",
                body: "\(player) has been sent off in the \(event.displayMinute) minute."
            )
        }
    }
}

/// Restricted subset of ``NotificationEventType`` that actually originates from a discrete
/// match event (as opposed to a status transition like kickoff/half-time/full-time).
private enum EventNotificationKind {
    case goal
    case redCard

    init?(_ type: NotificationEventType) {
        switch type {
        case .goal: self = .goal
        case .redCard: self = .redCard
        case .kickoff, .halfTime, .fullTime: return nil
        }
    }
}
