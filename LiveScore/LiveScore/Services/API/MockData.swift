import Foundation

/// Hand-authored sample data covering live, upcoming, finished, and postponed matches
/// across a few competitions so every screen has something realistic to render offline.
enum MockData {
    static let premierLeague = Competition(id: 2021, name: "Premier League", country: "England", emblemURL: nil)
    static let laLiga = Competition(id: 2014, name: "La Liga", country: "Spain", emblemURL: nil)
    static let championsLeague = Competition(id: 2001, name: "UEFA Champions League", country: "Europe", emblemURL: nil)

    static let arsenal = Team(id: 57, name: "Arsenal", shortName: "ARS", crestURL: nil, venue: "Emirates Stadium")
    static let chelsea = Team(id: 61, name: "Chelsea", shortName: "CHE", crestURL: nil, venue: "Stamford Bridge")
    static let liverpool = Team(id: 64, name: "Liverpool", shortName: "LIV", crestURL: nil, venue: "Anfield")
    static let manCity = Team(id: 65, name: "Manchester City", shortName: "MCI", crestURL: nil, venue: "Etihad Stadium")
    static let realMadrid = Team(id: 86, name: "Real Madrid", shortName: "RMA", crestURL: nil, venue: "Santiago Bernabéu")
    static let barcelona = Team(id: 81, name: "FC Barcelona", shortName: "BAR", crestURL: nil, venue: "Spotify Camp Nou")
    static let bayern = Team(id: 5, name: "Bayern Munich", shortName: "BAY", crestURL: nil, venue: "Allianz Arena")
    static let psg = Team(id: 524, name: "Paris Saint-Germain", shortName: "PSG", crestURL: nil, venue: "Parc des Princes")

    static let allTeams = [arsenal, chelsea, liverpool, manCity, realMadrid, barcelona, bayern, psg]

    static let matches: [Match] = {
        let now = Date()
        let calendar = Calendar.current

        let liveMatch = Match(
            id: 1001,
            competition: premierLeague,
            homeTeam: arsenal,
            awayTeam: chelsea,
            status: .live,
            score: Score(home: 2, away: 1),
            minute: 67,
            kickoff: calendar.date(byAdding: .minute, value: -67, to: now) ?? now,
            events: [
                MatchEvent(id: "e1", type: .kickoff, minute: 0, addedTime: nil, teamID: nil, playerName: nil, assistName: nil, detail: nil),
                MatchEvent(id: "e2", type: .goal, minute: 12, addedTime: nil, teamID: arsenal.id, playerName: "Bukayo Saka", assistName: "Martin Ødegaard", detail: nil),
                MatchEvent(id: "e3", type: .yellowCard, minute: 23, addedTime: nil, teamID: chelsea.id, playerName: "Enzo Fernández", assistName: nil, detail: nil),
                MatchEvent(id: "e4", type: .goal, minute: 38, addedTime: nil, teamID: chelsea.id, playerName: "Cole Palmer", assistName: nil, detail: nil),
                MatchEvent(id: "e5", type: .halfTime, minute: 45, addedTime: nil, teamID: nil, playerName: nil, assistName: nil, detail: nil),
                MatchEvent(id: "e6", type: .goal, minute: 58, addedTime: nil, teamID: arsenal.id, playerName: "Gabriel Jesus", assistName: "Declan Rice", detail: nil),
                MatchEvent(id: "e7", type: .varReview, minute: 64, addedTime: nil, teamID: nil, playerName: nil, assistName: nil, detail: "Penalty check overturned"),
            ]
        )

        let halfTimeMatch = Match(
            id: 1002,
            competition: laLiga,
            homeTeam: realMadrid,
            awayTeam: barcelona,
            status: .halfTime,
            score: Score(home: 1, away: 1),
            minute: 45,
            kickoff: calendar.date(byAdding: .minute, value: -50, to: now) ?? now,
            events: [
                MatchEvent(id: "e8", type: .goal, minute: 15, addedTime: nil, teamID: realMadrid.id, playerName: "Jude Bellingham", assistName: nil, detail: nil),
                MatchEvent(id: "e9", type: .goal, minute: 41, addedTime: 2, teamID: barcelona.id, playerName: "Robert Lewandowski", assistName: "Pedri", detail: nil),
                MatchEvent(id: "e10", type: .halfTime, minute: 45, addedTime: nil, teamID: nil, playerName: nil, assistName: nil, detail: nil),
            ]
        )

        let upcomingMatch = Match(
            id: 1003,
            competition: championsLeague,
            homeTeam: bayern,
            awayTeam: psg,
            status: .scheduled,
            score: Score(home: 0, away: 0),
            minute: nil,
            kickoff: calendar.date(byAdding: .hour, value: 4, to: now) ?? now,
            events: []
        )

        let laterUpcoming = Match(
            id: 1004,
            competition: premierLeague,
            homeTeam: liverpool,
            awayTeam: manCity,
            status: .scheduled,
            score: Score(home: 0, away: 0),
            minute: nil,
            kickoff: calendar.date(byAdding: .day, value: 1, to: now) ?? now,
            events: []
        )

        let finishedMatch = Match(
            id: 1005,
            competition: premierLeague,
            homeTeam: manCity,
            awayTeam: liverpool,
            status: .finished,
            score: Score(home: 3, away: 2),
            minute: 90,
            kickoff: calendar.date(byAdding: .hour, value: -5, to: now) ?? now,
            events: [
                MatchEvent(id: "e11", type: .goal, minute: 5, addedTime: nil, teamID: manCity.id, playerName: "Erling Haaland", assistName: nil, detail: nil),
                MatchEvent(id: "e12", type: .goal, minute: 34, addedTime: nil, teamID: liverpool.id, playerName: "Mohamed Salah", assistName: nil, detail: nil),
                MatchEvent(id: "e13", type: .redCard, minute: 52, addedTime: nil, teamID: liverpool.id, playerName: "Virgil van Dijk", assistName: nil, detail: nil),
                MatchEvent(id: "e14", type: .goal, minute: 61, addedTime: nil, teamID: manCity.id, playerName: "Kevin De Bruyne", assistName: nil, detail: nil),
                MatchEvent(id: "e15", type: .goal, minute: 78, addedTime: nil, teamID: liverpool.id, playerName: "Darwin Núñez", assistName: nil, detail: nil),
                MatchEvent(id: "e16", type: .goal, minute: 88, addedTime: 1, teamID: manCity.id, playerName: "Phil Foden", assistName: nil, detail: nil),
                MatchEvent(id: "e17", type: .fullTime, minute: 90, addedTime: nil, teamID: nil, playerName: nil, assistName: nil, detail: nil),
            ]
        )

        let postponedMatch = Match(
            id: 1006,
            competition: laLiga,
            homeTeam: barcelona,
            awayTeam: realMadrid,
            status: .postponed,
            score: Score(home: 0, away: 0),
            minute: nil,
            kickoff: calendar.date(byAdding: .day, value: 2, to: now) ?? now,
            events: []
        )

        return [liveMatch, halfTimeMatch, upcomingMatch, laterUpcoming, finishedMatch, postponedMatch]
    }()

    static let statistics: [Int: MatchStatistics] = [
        1001: MatchStatistics(
            possessionHome: 58, possessionAway: 42,
            shotsHome: 14, shotsAway: 9,
            shotsOnTargetHome: 6, shotsOnTargetAway: 4,
            cornersHome: 7, cornersAway: 3,
            foulsHome: 8, foulsAway: 11,
            offsidesHome: 2, offsidesAway: 1
        ),
        1002: MatchStatistics(
            possessionHome: 51, possessionAway: 49,
            shotsHome: 8, shotsAway: 7,
            shotsOnTargetHome: 3, shotsOnTargetAway: 3,
            cornersHome: 4, cornersAway: 5,
            foulsHome: 6, foulsAway: 6,
            offsidesHome: 0, offsidesAway: 2
        ),
    ]

    static let lineups: [Int: MatchLineups] = [
        1001: MatchLineups(
            home: TeamLineup(
                formation: "4-3-3",
                startingXI: formation433(startingNumber: 1),
                substitutes: bench(startingNumber: 12),
                coachName: "Mikel Arteta"
            ),
            away: TeamLineup(
                formation: "4-2-3-1",
                startingXI: formation4231(startingNumber: 30),
                substitutes: bench(startingNumber: 41),
                coachName: "Mauricio Pochettino"
            )
        ),
    ]

    static let standings: [Standing] = [
        Standing(position: 1, team: manCity, played: 20, won: 15, draw: 3, lost: 2, goalsFor: 48, goalsAgainst: 18, points: 48),
        Standing(position: 2, team: arsenal, played: 20, won: 14, draw: 4, lost: 2, goalsFor: 44, goalsAgainst: 20, points: 46),
        Standing(position: 3, team: liverpool, played: 20, won: 13, draw: 5, lost: 2, goalsFor: 42, goalsAgainst: 22, points: 44),
        Standing(position: 4, team: chelsea, played: 20, won: 10, draw: 6, lost: 4, goalsFor: 35, goalsAgainst: 25, points: 36),
    ]

    static func squad(for team: Team) -> [SquadPlayer] {
        let positions = ["Goalkeeper", "Defender", "Defender", "Defender", "Defender", "Midfielder", "Midfielder", "Midfielder", "Forward", "Forward", "Forward"]
        return positions.enumerated().map { index, position in
            SquadPlayer(
                id: team.id * 100 + index,
                name: "\(team.shortName) Player \(index + 1)",
                position: position,
                shirtNumber: index + 1,
                nationality: nil
            )
        }
    }

    private static func formation433(startingNumber: Int) -> [LineupPlayer] {
        let positions: [PitchPosition] = [
            .init(x: 0.05, y: 0.5),
            .init(x: 0.2, y: 0.15), .init(x: 0.2, y: 0.4), .init(x: 0.2, y: 0.6), .init(x: 0.2, y: 0.85),
            .init(x: 0.45, y: 0.25), .init(x: 0.45, y: 0.5), .init(x: 0.45, y: 0.75),
            .init(x: 0.75, y: 0.2), .init(x: 0.8, y: 0.5), .init(x: 0.75, y: 0.8),
        ]
        return positions.enumerated().map { index, position in
            LineupPlayer(id: startingNumber + index, name: "Player \(startingNumber + index)", shirtNumber: index + 1, position: position, isCaptain: index == 6)
        }
    }

    private static func formation4231(startingNumber: Int) -> [LineupPlayer] {
        let positions: [PitchPosition] = [
            .init(x: 0.05, y: 0.5),
            .init(x: 0.2, y: 0.15), .init(x: 0.2, y: 0.4), .init(x: 0.2, y: 0.6), .init(x: 0.2, y: 0.85),
            .init(x: 0.4, y: 0.35), .init(x: 0.4, y: 0.65),
            .init(x: 0.6, y: 0.15), .init(x: 0.65, y: 0.5), .init(x: 0.6, y: 0.85),
            .init(x: 0.85, y: 0.5),
        ]
        return positions.enumerated().map { index, position in
            LineupPlayer(id: startingNumber + index, name: "Player \(startingNumber + index)", shirtNumber: index + 1, position: position, isCaptain: index == 8)
        }
    }

    private static func bench(startingNumber: Int) -> [LineupPlayer] {
        (0..<7).map { index in
            LineupPlayer(id: startingNumber + index, name: "Sub \(startingNumber + index)", shirtNumber: 12 + index, position: .init(x: 0, y: 0), isCaptain: false)
        }
    }
}
