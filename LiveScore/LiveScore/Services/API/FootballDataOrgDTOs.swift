import Foundation

/// Raw response shapes for api.football-data.org/v4. Kept private to this file's mapping
/// extensions — the rest of the app only ever sees the app's own `Model` types.
enum FDO {
    struct AreaDTO: Decodable { let name: String? }

    struct CompetitionDTO: Decodable {
        let id: Int
        let name: String
        let emblem: String?
        let area: AreaDTO?
    }

    struct TeamDTO: Decodable {
        let id: Int
        let name: String
        let shortName: String?
        let tla: String?
        let crest: String?
        let venue: String?
    }

    struct ScoreFullTimeDTO: Decodable {
        let home: Int?
        let away: Int?
    }

    struct ScoreDTO: Decodable {
        let winner: String?
        let fullTime: ScoreFullTimeDTO?
        let halfTime: ScoreFullTimeDTO?
    }

    struct GoalDTO: Decodable {
        let minute: Int?
        let injuryTime: Int?
        let type: String?
        let team: TeamRefDTO?
        let scorer: PersonRefDTO?
        let assist: PersonRefDTO?
    }

    struct BookingDTO: Decodable {
        let minute: Int?
        let team: TeamRefDTO?
        let player: PersonRefDTO?
        let card: String?
    }

    struct SubstitutionDTO: Decodable {
        let minute: Int?
        let team: TeamRefDTO?
        let playerOut: PersonRefDTO?
        let playerIn: PersonRefDTO?
    }

    struct TeamRefDTO: Decodable { let id: Int? }
    struct PersonRefDTO: Decodable { let id: Int?; let name: String? }

    struct MatchDTO: Decodable {
        let id: Int
        let utcDate: String
        let status: String
        let minute: Int?
        let competition: CompetitionDTO
        let homeTeam: TeamDTO
        let awayTeam: TeamDTO
        let score: ScoreDTO
        let goals: [GoalDTO]?
        let bookings: [BookingDTO]?
        let substitutions: [SubstitutionDTO]?
    }

    struct MatchesResponseDTO: Decodable { let matches: [MatchDTO] }
    struct MatchResponseDTO: Decodable { let match: MatchDTO }
    struct CompetitionsResponseDTO: Decodable { let competitions: [CompetitionDTO] }

    struct SquadPlayerDTO: Decodable {
        let id: Int
        let name: String
        let position: String?
        let shirtNumber: Int?
        let nationality: String?
    }

    struct TeamDetailDTO: Decodable {
        let id: Int
        let name: String
        let shortName: String?
        let crest: String?
        let venue: String?
        let runningCompetitions: [CompetitionDTO]?
        let squad: [SquadPlayerDTO]?
    }

    struct StandingTableRowDTO: Decodable {
        let position: Int
        let team: TeamDTO
        let playedGames: Int
        let won: Int
        let draw: Int
        let lost: Int
        let goalsFor: Int
        let goalsAgainst: Int
        let points: Int
    }

    struct StandingGroupDTO: Decodable {
        let type: String
        let table: [StandingTableRowDTO]
    }

    struct StandingsResponseDTO: Decodable { let standings: [StandingGroupDTO] }
}

// MARK: - Mapping to app models

extension FDO.TeamDTO {
    func toModel() -> Team {
        Team(
            id: id,
            name: name,
            shortName: shortName ?? tla ?? name,
            crestURL: crest.flatMap(URL.init(string:)),
            venue: venue
        )
    }
}

extension FDO.CompetitionDTO {
    func toModel() -> Competition {
        Competition(
            id: id,
            name: name,
            country: area?.name ?? "",
            emblemURL: emblem.flatMap(URL.init(string:))
        )
    }
}

extension FDO.MatchDTO {
    private static let isoFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter
    }()

    func toModel() -> Match {
        let kickoffDate = Self.isoFormatter.date(from: utcDate) ?? Date()
        return Match(
            id: id,
            competition: competition.toModel(),
            homeTeam: homeTeam.toModel(),
            awayTeam: awayTeam.toModel(),
            status: Self.mapStatus(status),
            score: Score(home: score.fullTime?.home ?? 0, away: score.fullTime?.away ?? 0),
            minute: minute,
            kickoff: kickoffDate,
            events: mapEvents()
        )
    }

    func mapEvents() -> [MatchEvent] {
        var events: [MatchEvent] = []

        for (index, goal) in (goals ?? []).enumerated() {
            let type: MatchEventType = {
                switch goal.type?.uppercased() {
                case "OWN": return .ownGoal
                case "PENALTY": return .penaltyGoal
                default: return .goal
                }
            }()
            events.append(MatchEvent(
                id: "goal-\(index)",
                type: type,
                minute: goal.minute ?? 0,
                addedTime: goal.injuryTime,
                teamID: goal.team?.id,
                playerName: goal.scorer?.name,
                assistName: goal.assist?.name,
                detail: nil
            ))
        }

        for (index, booking) in (bookings ?? []).enumerated() {
            let type: MatchEventType = booking.card?.uppercased() == "RED" ? .redCard : .yellowCard
            events.append(MatchEvent(
                id: "booking-\(index)",
                type: type,
                minute: booking.minute ?? 0,
                addedTime: nil,
                teamID: booking.team?.id,
                playerName: booking.player?.name,
                assistName: nil,
                detail: nil
            ))
        }

        for (index, sub) in (substitutions ?? []).enumerated() {
            events.append(MatchEvent(
                id: "sub-\(index)",
                type: .substitution,
                minute: sub.minute ?? 0,
                addedTime: nil,
                teamID: sub.team?.id,
                playerName: sub.playerIn?.name,
                assistName: sub.playerOut?.name,
                detail: nil
            ))
        }

        return events.sorted { $0.minute < $1.minute }
    }

    static func mapStatus(_ raw: String) -> MatchStatus {
        switch raw.uppercased() {
        case "SCHEDULED", "TIMED": return .scheduled
        case "IN_PLAY": return .live
        case "PAUSED": return .halfTime
        case "FINISHED": return .finished
        case "POSTPONED": return .postponed
        case "SUSPENDED": return .suspended
        case "CANCELLED": return .cancelled
        default: return .scheduled
        }
    }
}

extension FDO.SquadPlayerDTO {
    func toModel() -> SquadPlayer {
        SquadPlayer(id: id, name: name, position: position ?? "Unknown", shirtNumber: shirtNumber, nationality: nationality)
    }
}

extension FDO.StandingTableRowDTO {
    func toModel() -> Standing {
        Standing(
            position: position,
            team: team.toModel(),
            played: playedGames,
            won: won,
            draw: draw,
            lost: lost,
            goalsFor: goalsFor,
            goalsAgainst: goalsAgainst,
            points: points
        )
    }
}
