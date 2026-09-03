import Foundation

struct Team: Identifiable, Hashable, Codable, Sendable {
    let id: Int
    let name: String
    let shortName: String
    let crestURL: URL?
    let venue: String?
}

struct SquadPlayer: Identifiable, Hashable, Codable, Sendable {
    let id: Int
    let name: String
    let position: String
    let shirtNumber: Int?
    let nationality: String?
}

struct TeamProfile: Identifiable, Hashable, Codable, Sendable {
    let team: Team
    let competition: Competition
    let squad: [SquadPlayer]
    let upcomingFixtures: [Match]
    let recentResults: [Match]

    var id: Int { team.id }
}
