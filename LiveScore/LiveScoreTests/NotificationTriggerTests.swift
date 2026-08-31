import XCTest
@testable import LiveScore

final class NotificationTriggerTests: XCTestCase {
    private func makeMatch(status: MatchStatus, score: Score = Score(home: 0, away: 0), events: [MatchEvent] = []) -> Match {
        Match(
            id: 1,
            competition: MockData.premierLeague,
            homeTeam: MockData.arsenal,
            awayTeam: MockData.chelsea,
            status: status,
            score: score,
            minute: nil,
            kickoff: Date(),
            events: events
        )
    }

    func testIneligibleMatchProducesNoNotifications() {
        let engine = NotificationTriggerEngine(enabledEvents: Set(NotificationEventType.allCases))
        let match = makeMatch(status: .live)
        let result = engine.notifications(previous: makeMatch(status: .scheduled), current: match, isEligible: false)
        XCTAssertTrue(result.isEmpty)
    }

    func testScheduledToLiveFiresKickoffNotification() {
        let engine = NotificationTriggerEngine(enabledEvents: Set(NotificationEventType.allCases))
        let result = engine.notifications(previous: makeMatch(status: .scheduled), current: makeMatch(status: .live), isEligible: true)
        XCTAssertEqual(result.count, 1)
        XCTAssertEqual(result[0].eventType, .kickoff)
    }

    func testKickoffNotificationSuppressedWhenDisabled() {
        let engine = NotificationTriggerEngine(enabledEvents: Set(NotificationEventType.allCases).subtracting([.kickoff]))
        let result = engine.notifications(previous: makeMatch(status: .scheduled), current: makeMatch(status: .live), isEligible: true)
        XCTAssertTrue(result.isEmpty)
    }

    func testLiveToHalfTimeFiresHalfTimeNotification() {
        let engine = NotificationTriggerEngine(enabledEvents: Set(NotificationEventType.allCases))
        let result = engine.notifications(previous: makeMatch(status: .live), current: makeMatch(status: .halfTime), isEligible: true)
        XCTAssertEqual(result.count, 1)
        XCTAssertEqual(result[0].eventType, .halfTime)
    }

    func testLiveToFinishedFiresFullTimeNotificationWithFinalScore() {
        let engine = NotificationTriggerEngine(enabledEvents: Set(NotificationEventType.allCases))
        let result = engine.notifications(
            previous: makeMatch(status: .live, score: Score(home: 1, away: 0)),
            current: makeMatch(status: .finished, score: Score(home: 2, away: 1)),
            isEligible: true
        )
        XCTAssertEqual(result.count, 1)
        XCTAssertEqual(result[0].eventType, .fullTime)
        XCTAssertTrue(result[0].body.contains("2 - 1"))
    }

    func testRepeatedStatusDoesNotRefireNotification() {
        let engine = NotificationTriggerEngine(enabledEvents: Set(NotificationEventType.allCases))
        let result = engine.notifications(previous: makeMatch(status: .live), current: makeMatch(status: .live), isEligible: true)
        XCTAssertTrue(result.isEmpty)
    }

    func testNewGoalEventFiresGoalNotification() {
        let engine = NotificationTriggerEngine(enabledEvents: Set(NotificationEventType.allCases))
        let goal = MatchEvent(id: "g1", type: .goal, minute: 10, addedTime: nil, teamID: MockData.arsenal.id, playerName: "Bukayo Saka", assistName: nil, detail: nil)
        let previous = makeMatch(status: .live, score: Score(home: 0, away: 0))
        let current = makeMatch(status: .live, score: Score(home: 1, away: 0), events: [goal])

        let result = engine.notifications(previous: previous, current: current, isEligible: true)
        XCTAssertEqual(result.count, 1)
        XCTAssertEqual(result[0].eventType, .goal)
        XCTAssertTrue(result[0].body.contains("Bukayo Saka"))
    }

    func testGoalNotificationSuppressedWhenGoalsDisabled() {
        let engine = NotificationTriggerEngine(enabledEvents: Set(NotificationEventType.allCases).subtracting([.goal]))
        let goal = MatchEvent(id: "g1", type: .goal, minute: 10, addedTime: nil, teamID: MockData.arsenal.id, playerName: "Bukayo Saka", assistName: nil, detail: nil)
        let previous = makeMatch(status: .live)
        let current = makeMatch(status: .live, score: Score(home: 1, away: 0), events: [goal])

        let result = engine.notifications(previous: previous, current: current, isEligible: true)
        XCTAssertTrue(result.isEmpty)
    }

    func testRedCardEventFiresRedCardNotification() {
        let engine = NotificationTriggerEngine(enabledEvents: Set(NotificationEventType.allCases))
        let redCard = MatchEvent(id: "r1", type: .redCard, minute: 55, addedTime: nil, teamID: MockData.chelsea.id, playerName: "Levi Colwill", assistName: nil, detail: nil)
        let previous = makeMatch(status: .live)
        let current = makeMatch(status: .live, events: [redCard])

        let result = engine.notifications(previous: previous, current: current, isEligible: true)
        XCTAssertEqual(result.count, 1)
        XCTAssertEqual(result[0].eventType, .redCard)
        XCTAssertTrue(result[0].body.contains("Levi Colwill"))
    }

    func testAlreadySeenEventDoesNotRefire() {
        let engine = NotificationTriggerEngine(enabledEvents: Set(NotificationEventType.allCases))
        let goal = MatchEvent(id: "g1", type: .goal, minute: 10, addedTime: nil, teamID: MockData.arsenal.id, playerName: "Bukayo Saka", assistName: nil, detail: nil)
        let match = makeMatch(status: .live, score: Score(home: 1, away: 0), events: [goal])

        let result = engine.notifications(previous: match, current: match, isEligible: true)
        XCTAssertTrue(result.isEmpty)
    }

    func testFirstSightingOfAnInProgressMatchDoesNotReplayHistoricalEvents() {
        // When a user stars a team mid-match, the match is seen for the first time already
        // carrying past events. Those must not all fire at once — only what happens next.
        let engine = NotificationTriggerEngine(enabledEvents: Set(NotificationEventType.allCases))
        let pastGoal = MatchEvent(id: "g1", type: .goal, minute: 10, addedTime: nil, teamID: MockData.arsenal.id, playerName: "Bukayo Saka", assistName: nil, detail: nil)
        let current = makeMatch(status: .live, score: Score(home: 1, away: 0), events: [pastGoal])

        let result = engine.notifications(previous: nil, current: current, isEligible: true)
        XCTAssertTrue(result.isEmpty)
    }
}
