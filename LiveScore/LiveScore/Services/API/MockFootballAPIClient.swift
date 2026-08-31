import Foundation

/// Deterministic, offline data source so the entire UI is testable without any API key.
/// Also used as the default dependency in unit tests and SwiftUI previews.
final class MockFootballAPIClient: FootballAPIClient {
    private let simulatedLatency: Duration
    private let shouldFail: Bool

    init(simulatedLatency: Duration = .milliseconds(250), shouldFail: Bool = false) {
        self.simulatedLatency = simulatedLatency
        self.shouldFail = shouldFail
    }

    func fetchMatches(on date: Date) async throws -> [Match] {
        try await simulateWork()
        return MockData.matches
    }

    func fetchMatch(id: Int) async throws -> Match {
        try await simulateWork()
        guard let match = MockData.matches.first(where: { $0.id == id }) else {
            throw APIError.notFound
        }
        return match
    }

    func fetchMatchEvents(matchID: Int) async throws -> [MatchEvent] {
        try await simulateWork()
        return MockData.matches.first(where: { $0.id == matchID })?.events ?? []
    }

    func fetchMatchStatistics(matchID: Int) async throws -> MatchStatistics? {
        try await simulateWork()
        return MockData.statistics[matchID]
    }

    func fetchLineups(matchID: Int) async throws -> MatchLineups? {
        try await simulateWork()
        return MockData.lineups[matchID]
    }

    func fetchHeadToHead(homeTeamID: Int, awayTeamID: Int) async throws -> HeadToHeadRecord {
        try await simulateWork()
        let recent = MockData.matches.filter {
            $0.status == .finished && (($0.homeTeam.id == homeTeamID && $0.awayTeam.id == awayTeamID) ||
                                        ($0.homeTeam.id == awayTeamID && $0.awayTeam.id == homeTeamID))
        }
        return HeadToHeadRecord(homeWins: 3, draws: 2, awayWins: 1, recentMeetings: recent)
    }

    func fetchTeamProfile(teamID: Int) async throws -> TeamProfile {
        try await simulateWork()
        guard let team = MockData.allTeams.first(where: { $0.id == teamID }) else {
            throw APIError.notFound
        }
        let competition = MockData.matches.first(where: { $0.involves(teamID: teamID) })?.competition ?? MockData.premierLeague
        let upcoming = MockData.matches.filter { $0.involves(teamID: teamID) && $0.status == .scheduled }
        let recent = MockData.matches.filter { $0.involves(teamID: teamID) && $0.status == .finished }
        return TeamProfile(
            team: team,
            competition: competition,
            squad: MockData.squad(for: team),
            upcomingFixtures: upcoming,
            recentResults: recent
        )
    }

    func fetchStandings(competitionID: Int) async throws -> [Standing] {
        try await simulateWork()
        return MockData.standings.filter { _ in true }
    }

    func fetchCompetitions() async throws -> [Competition] {
        try await simulateWork()
        return [MockData.premierLeague, MockData.laLiga, MockData.championsLeague]
    }

    func searchTeams(query: String) async throws -> [Team] {
        try await simulateWork()
        guard !query.isEmpty else { return [] }
        return MockData.allTeams.filter { $0.name.localizedCaseInsensitiveContains(query) }
    }

    private func simulateWork() async throws {
        try await Task.sleep(for: simulatedLatency)
        if shouldFail {
            throw APIError.network("Simulated failure")
        }
    }
}
