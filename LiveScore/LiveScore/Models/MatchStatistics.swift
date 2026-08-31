import Foundation

struct MatchStatistics: Hashable, Codable, Sendable {
    struct Pair: Hashable, Codable, Sendable {
        let label: String
        let home: Double
        let away: Double
        let isPercentage: Bool
    }

    let possessionHome: Double
    let possessionAway: Double
    let shotsHome: Int
    let shotsAway: Int
    let shotsOnTargetHome: Int
    let shotsOnTargetAway: Int
    let cornersHome: Int
    let cornersAway: Int
    let foulsHome: Int
    let foulsAway: Int
    let offsidesHome: Int
    let offsidesAway: Int

    var rows: [Pair] {
        [
            Pair(label: "Possession", home: possessionHome, away: possessionAway, isPercentage: true),
            Pair(label: "Shots", home: Double(shotsHome), away: Double(shotsAway), isPercentage: false),
            Pair(label: "Shots on Target", home: Double(shotsOnTargetHome), away: Double(shotsOnTargetAway), isPercentage: false),
            Pair(label: "Corners", home: Double(cornersHome), away: Double(cornersAway), isPercentage: false),
            Pair(label: "Fouls", home: Double(foulsHome), away: Double(foulsAway), isPercentage: false),
            Pair(label: "Offsides", home: Double(offsidesHome), away: Double(offsidesAway), isPercentage: false),
        ]
    }
}

struct LineupPlayer: Identifiable, Hashable, Codable, Sendable {
    let id: Int
    let name: String
    let shirtNumber: Int
    /// Normalized 0...1 pitch position, (0,0) = own goal line left, (1,1) = opponent goal line right.
    let position: PitchPosition
    let isCaptain: Bool
}

struct PitchPosition: Hashable, Codable, Sendable {
    let x: Double
    let y: Double
}

struct TeamLineup: Hashable, Codable, Sendable {
    let formation: String
    let startingXI: [LineupPlayer]
    let substitutes: [LineupPlayer]
    let coachName: String?
}

struct MatchLineups: Hashable, Codable, Sendable {
    let home: TeamLineup
    let away: TeamLineup
}

struct HeadToHeadRecord: Hashable, Codable, Sendable {
    let homeWins: Int
    let draws: Int
    let awayWins: Int
    let recentMeetings: [Match]
}
