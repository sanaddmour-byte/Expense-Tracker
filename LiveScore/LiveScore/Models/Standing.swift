import Foundation

struct Standing: Identifiable, Hashable, Codable, Sendable {
    let position: Int
    let team: Team
    let played: Int
    let won: Int
    let draw: Int
    let lost: Int
    let goalsFor: Int
    let goalsAgainst: Int
    let points: Int

    var id: Int { team.id }
    var goalDifference: Int { goalsFor - goalsAgainst }
}
