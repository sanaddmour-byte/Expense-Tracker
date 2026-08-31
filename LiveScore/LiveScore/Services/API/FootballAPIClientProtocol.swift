import Foundation

/// Abstraction over a live-football data provider (Football-Data.org, API-Football, ...).
/// Every concrete provider — real network client or mock — conforms to this so the rest
/// of the app never depends on a specific vendor's response shapes.
protocol FootballAPIClient: Sendable {
    func fetchMatches(on date: Date) async throws -> [Match]
    func fetchMatch(id: Int) async throws -> Match
    func fetchMatchEvents(matchID: Int) async throws -> [MatchEvent]
    func fetchMatchStatistics(matchID: Int) async throws -> MatchStatistics?
    func fetchLineups(matchID: Int) async throws -> MatchLineups?
    func fetchHeadToHead(homeTeamID: Int, awayTeamID: Int) async throws -> HeadToHeadRecord
    func fetchTeamProfile(teamID: Int) async throws -> TeamProfile
    func fetchStandings(competitionID: Int) async throws -> [Standing]
    func fetchCompetitions() async throws -> [Competition]
    func searchTeams(query: String) async throws -> [Team]
}
