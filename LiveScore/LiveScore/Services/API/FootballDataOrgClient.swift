import Foundation

/// Live implementation of ``FootballAPIClient`` backed by api.football-data.org/v4.
/// The free tier does not expose possession/shots statistics or lineups for most
/// competitions, so those methods return `nil` rather than throwing — callers already
/// treat them as optional.
final class FootballDataOrgClient: FootballAPIClient {
    private let baseURL: URL
    private let apiKey: String
    private let session: URLSession
    private let decoder: JSONDecoder

    init(baseURL: URL = AppConfig.footballDataBaseURL, apiKey: String = AppConfig.footballDataKey, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.apiKey = apiKey
        self.session = session
        self.decoder = JSONDecoder()
    }

    func fetchMatches(on date: Date) async throws -> [Match] {
        let dayString = Self.dayFormatter.string(from: date)
        let response: FDO.MatchesResponseDTO = try await get("/matches", query: ["dateFrom": dayString, "dateTo": dayString])
        return response.matches.map { $0.toModel() }
    }

    func fetchMatch(id: Int) async throws -> Match {
        let response: FDO.MatchResponseDTO = try await get("/matches/\(id)")
        return response.match.toModel()
    }

    func fetchMatchEvents(matchID: Int) async throws -> [MatchEvent] {
        let response: FDO.MatchResponseDTO = try await get("/matches/\(matchID)")
        return response.match.mapEvents()
    }

    func fetchMatchStatistics(matchID: Int) async throws -> MatchStatistics? {
        nil // Not available on the free football-data.org tier.
    }

    func fetchLineups(matchID: Int) async throws -> MatchLineups? {
        nil // Not available on the free football-data.org tier.
    }

    func fetchHeadToHead(homeTeamID: Int, awayTeamID: Int) async throws -> HeadToHeadRecord {
        HeadToHeadRecord(homeWins: 0, draws: 0, awayWins: 0, recentMeetings: [])
    }

    func fetchTeamProfile(teamID: Int) async throws -> TeamProfile {
        let detail: FDO.TeamDetailDTO = try await get("/teams/\(teamID)")
        let team = Team(
            id: detail.id,
            name: detail.name,
            shortName: detail.shortName ?? detail.name,
            crestURL: detail.crest.flatMap(URL.init(string:)),
            venue: detail.venue
        )
        let competition = detail.runningCompetitions?.first?.toModel()
            ?? Competition(id: 0, name: "Unknown", country: "", emblemURL: nil)
        let squad = (detail.squad ?? []).map { $0.toModel() }
        return TeamProfile(team: team, competition: competition, squad: squad, upcomingFixtures: [], recentResults: [])
    }

    func fetchStandings(competitionID: Int) async throws -> [Standing] {
        let response: FDO.StandingsResponseDTO = try await get("/competitions/\(competitionID)/standings")
        guard let total = response.standings.first(where: { $0.type == "TOTAL" }) ?? response.standings.first else {
            return []
        }
        return total.table.map { $0.toModel() }
    }

    func fetchCompetitions() async throws -> [Competition] {
        let response: FDO.CompetitionsResponseDTO = try await get("/competitions")
        return response.competitions.map { $0.toModel() }
    }

    func searchTeams(query: String) async throws -> [Team] {
        // football-data.org has no free-text team search; callers should filter
        // already-fetched matches/standings client-side instead.
        []
    }

    // MARK: - Networking

    private func get<T: Decodable>(_ path: String, query: [String: String] = [:]) async throws -> T {
        guard var components = URLComponents(url: baseURL.appendingPathComponent(path), resolvingAgainstBaseURL: false) else {
            throw APIError.network("Invalid URL")
        }
        if !query.isEmpty {
            components.queryItems = query.map { URLQueryItem(name: $0.key, value: $0.value) }
        }
        guard let url = components.url else { throw APIError.network("Invalid URL") }

        var request = URLRequest(url: url)
        request.setValue(apiKey, forHTTPHeaderField: "X-Auth-Token")

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw APIError.network(error.localizedDescription)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.network("No HTTP response")
        }

        switch httpResponse.statusCode {
        case 200..<300:
            break
        case 401, 403:
            throw APIError.unauthorized
        case 404:
            throw APIError.notFound
        case 429:
            throw APIError.rateLimited
        default:
            throw APIError.unknown(httpResponse.statusCode)
        }

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decoding(error.localizedDescription)
        }
    }

    private static let dayFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.timeZone = TimeZone(identifier: "UTC")
        return formatter
    }()
}
