import Foundation

/// Thin façade over ``FootballAPIClient`` — the seam where a future provider swap,
/// caching, or offline-first behavior would live without touching view models.
protocol MatchRepositoryProtocol: Sendable {
    func matches(on date: Date) async throws -> [Match]
    func match(id: Int) async throws -> Match
    func events(matchID: Int) async throws -> [MatchEvent]
    func statistics(matchID: Int) async throws -> MatchStatistics?
    func lineups(matchID: Int) async throws -> MatchLineups?
    func headToHead(homeTeamID: Int, awayTeamID: Int) async throws -> HeadToHeadRecord
    func teamProfile(teamID: Int) async throws -> TeamProfile
    func standings(competitionID: Int) async throws -> [Standing]
    func competitions() async throws -> [Competition]
    func searchTeams(query: String) async throws -> [Team]
}

final class MatchRepository: MatchRepositoryProtocol {
    private let client: FootballAPIClient

    init(client: FootballAPIClient) {
        self.client = client
    }

    func matches(on date: Date) async throws -> [Match] {
        try await client.fetchMatches(on: date)
    }

    func match(id: Int) async throws -> Match {
        try await client.fetchMatch(id: id)
    }

    func events(matchID: Int) async throws -> [MatchEvent] {
        try await client.fetchMatchEvents(matchID: matchID)
    }

    func statistics(matchID: Int) async throws -> MatchStatistics? {
        try await client.fetchMatchStatistics(matchID: matchID)
    }

    func lineups(matchID: Int) async throws -> MatchLineups? {
        try await client.fetchLineups(matchID: matchID)
    }

    func headToHead(homeTeamID: Int, awayTeamID: Int) async throws -> HeadToHeadRecord {
        try await client.fetchHeadToHead(homeTeamID: homeTeamID, awayTeamID: awayTeamID)
    }

    func teamProfile(teamID: Int) async throws -> TeamProfile {
        try await client.fetchTeamProfile(teamID: teamID)
    }

    func standings(competitionID: Int) async throws -> [Standing] {
        try await client.fetchStandings(competitionID: competitionID)
    }

    func competitions() async throws -> [Competition] {
        try await client.fetchCompetitions()
    }

    func searchTeams(query: String) async throws -> [Team] {
        try await client.searchTeams(query: query)
    }
}
