import XCTest
@testable import LiveScore

final class ScoreParsingTests: XCTestCase {
    private let sampleJSON = """
    {
      "match": {
        "id": 42,
        "utcDate": "2026-08-31T15:00:00Z",
        "status": "IN_PLAY",
        "minute": 57,
        "competition": { "id": 2021, "name": "Premier League", "emblem": null, "area": { "name": "England" } },
        "homeTeam": { "id": 57, "name": "Arsenal FC", "shortName": "Arsenal", "tla": "ARS", "crest": null, "venue": "Emirates Stadium" },
        "awayTeam": { "id": 61, "name": "Chelsea FC", "shortName": "Chelsea", "tla": "CHE", "crest": null, "venue": null },
        "score": {
          "winner": null,
          "fullTime": { "home": 2, "away": 1 },
          "halfTime": { "home": 1, "away": 1 }
        },
        "goals": [
          { "minute": 12, "injuryTime": null, "type": "REGULAR", "team": { "id": 57 }, "scorer": { "id": 1, "name": "Bukayo Saka" }, "assist": { "id": 2, "name": "Martin Ødegaard" } },
          { "minute": 90, "injuryTime": 3, "type": "PENALTY", "team": { "id": 61 }, "scorer": { "id": 3, "name": "Cole Palmer" }, "assist": null }
        ],
        "bookings": [
          { "minute": 23, "team": { "id": 61 }, "player": { "id": 4, "name": "Enzo Fernández" }, "card": "YELLOW" },
          { "minute": 80, "team": { "id": 57 }, "player": { "id": 5, "name": "Declan Rice" }, "card": "RED" }
        ],
        "substitutions": [
          { "minute": 70, "team": { "id": 57 }, "playerOut": { "id": 6, "name": "Gabriel Jesus" }, "playerIn": { "id": 7, "name": "Kai Havertz" } }
        ]
      }
    }
    """

    private func decodeMatch() throws -> Match {
        let data = Data(sampleJSON.utf8)
        let response = try JSONDecoder().decode(FDO.MatchResponseDTO.self, from: data)
        return response.match.toModel()
    }

    func testMapsBasicFields() throws {
        let match = try decodeMatch()
        XCTAssertEqual(match.id, 42)
        XCTAssertEqual(match.homeTeam.name, "Arsenal FC")
        XCTAssertEqual(match.awayTeam.shortName, "Chelsea")
        XCTAssertEqual(match.competition.country, "England")
    }

    func testMapsStatusFromRawFootballDataValues() {
        XCTAssertEqual(FDO.MatchDTO.mapStatus("SCHEDULED"), .scheduled)
        XCTAssertEqual(FDO.MatchDTO.mapStatus("TIMED"), .scheduled)
        XCTAssertEqual(FDO.MatchDTO.mapStatus("IN_PLAY"), .live)
        XCTAssertEqual(FDO.MatchDTO.mapStatus("PAUSED"), .halfTime)
        XCTAssertEqual(FDO.MatchDTO.mapStatus("FINISHED"), .finished)
        XCTAssertEqual(FDO.MatchDTO.mapStatus("POSTPONED"), .postponed)
        XCTAssertEqual(FDO.MatchDTO.mapStatus("SUSPENDED"), .suspended)
        XCTAssertEqual(FDO.MatchDTO.mapStatus("CANCELLED"), .cancelled)
        XCTAssertEqual(FDO.MatchDTO.mapStatus("unknown-value"), .scheduled)
    }

    func testMapsFullTimeScoreNotHalfTimeScore() throws {
        let match = try decodeMatch()
        XCTAssertEqual(match.score.home, 2)
        XCTAssertEqual(match.score.away, 1)
    }

    func testMapsAndSortsEventsAcrossGoalsBookingsAndSubstitutions() throws {
        let match = try decodeMatch()
        XCTAssertEqual(match.events.count, 5)
        XCTAssertEqual(match.events.map(\.minute), [12, 23, 70, 80, 90])

        let firstGoal = match.events[0]
        XCTAssertEqual(firstGoal.type, .goal)
        XCTAssertEqual(firstGoal.playerName, "Bukayo Saka")
        XCTAssertEqual(firstGoal.assistName, "Martin Ødegaard")

        let penalty = match.events.last!
        XCTAssertEqual(penalty.type, .penaltyGoal)
        XCTAssertEqual(penalty.addedTime, 3)
        XCTAssertEqual(penalty.displayMinute, "90+3'")

        let redCard = match.events.first { $0.type == .redCard }
        XCTAssertEqual(redCard?.playerName, "Declan Rice")

        let substitution = match.events.first { $0.type == .substitution }
        XCTAssertEqual(substitution?.playerName, "Kai Havertz")
        XCTAssertEqual(substitution?.assistName, "Gabriel Jesus")
    }

    func testDisplayMinuteWithoutAddedTime() {
        let event = MatchEvent(id: "1", type: .goal, minute: 34, addedTime: nil, teamID: nil, playerName: nil, assistName: nil, detail: nil)
        XCTAssertEqual(event.displayMinute, "34'")
    }

    func testDisplayMinuteWithZeroAddedTimeOmitsPlus() {
        let event = MatchEvent(id: "1", type: .goal, minute: 45, addedTime: 0, teamID: nil, playerName: nil, assistName: nil, detail: nil)
        XCTAssertEqual(event.displayMinute, "45'")
    }

    func testMatchFeedFilterLiveMatchesStatus() {
        var match = MockData.matches[0]
        match.status = .live
        XCTAssertTrue(MatchFeedFilter.live.matches(match))
        match.status = .halfTime
        XCTAssertTrue(MatchFeedFilter.live.matches(match))
        match.status = .finished
        XCTAssertFalse(MatchFeedFilter.live.matches(match))
    }
}
