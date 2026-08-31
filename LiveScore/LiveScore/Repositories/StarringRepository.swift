import Foundation
import SwiftData

/// Owns all read/write access to starred teams and starred matches. Kept separate from
/// SwiftUI's `@Query`/`@Environment(\.modelContext)` so the starring logic — including
/// what counts as "should this generate a notification subscription" — can be unit tested
/// without a view hierarchy.
@MainActor
final class StarringRepository {
    private let context: ModelContext

    init(context: ModelContext) {
        self.context = context
    }

    // MARK: - Teams

    func isTeamStarred(_ teamID: Int) -> Bool {
        starredTeam(teamID) != nil
    }

    func starredTeam(_ teamID: Int) -> StarredTeam? {
        let descriptor = FetchDescriptor<StarredTeam>(predicate: #Predicate { $0.teamID == teamID })
        return try? context.fetch(descriptor).first
    }

    func allStarredTeams() -> [StarredTeam] {
        (try? context.fetch(FetchDescriptor<StarredTeam>(sortBy: [SortDescriptor(\.dateAdded, order: .reverse)]))) ?? []
    }

    @discardableResult
    func starTeam(_ team: Team, competition: Competition) -> StarredTeam {
        if let existing = starredTeam(team.id) { return existing }
        let starred = StarredTeam(
            teamID: team.id,
            teamName: team.name,
            crestURLString: team.crestURL?.absoluteString,
            competitionID: competition.id,
            competitionName: competition.name
        )
        context.insert(starred)
        return starred
    }

    func unstarTeam(_ teamID: Int) {
        guard let existing = starredTeam(teamID) else { return }
        context.delete(existing)
    }

    func toggleTeamMute(_ teamID: Int) {
        starredTeam(teamID)?.isMuted.toggle()
    }

    // MARK: - Matches

    func isMatchStarred(_ matchID: Int) -> Bool {
        starredMatch(matchID) != nil
    }

    func starredMatch(_ matchID: Int) -> StarredMatch? {
        let descriptor = FetchDescriptor<StarredMatch>(predicate: #Predicate { $0.matchID == matchID })
        return try? context.fetch(descriptor).first
    }

    func allStarredMatches() -> [StarredMatch] {
        (try? context.fetch(FetchDescriptor<StarredMatch>(sortBy: [SortDescriptor(\.kickoff)]))) ?? []
    }

    @discardableResult
    func starMatch(_ match: Match) -> StarredMatch {
        if let existing = starredMatch(match.id) { return existing }
        let starred = StarredMatch(
            matchID: match.id,
            homeTeamName: match.homeTeam.name,
            awayTeamName: match.awayTeam.name,
            competitionName: match.competition.name,
            kickoff: match.kickoff
        )
        context.insert(starred)
        return starred
    }

    func unstarMatch(_ matchID: Int) {
        guard let existing = starredMatch(matchID) else { return }
        context.delete(existing)
    }

    /// Whether a live match should be eligible for notifications: it's either an
    /// individually-starred match, or involves a starred, non-muted team.
    func isEligibleForNotifications(_ match: Match) -> Bool {
        if isMatchStarred(match.id) { return true }
        let starredTeamIDs = Set(allStarredTeams().filter { !$0.isMuted }.map(\.teamID))
        return starredTeamIDs.contains(match.homeTeam.id) || starredTeamIDs.contains(match.awayTeam.id)
    }
}
