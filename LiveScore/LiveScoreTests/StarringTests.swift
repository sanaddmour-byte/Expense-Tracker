import XCTest
import SwiftData
@testable import LiveScore

@MainActor
final class StarringTests: XCTestCase {
    private var container: ModelContainer!
    private var repository: StarringRepository!

    override func setUp() {
        super.setUp()
        container = PersistenceController.makeContainer(inMemory: true)
        repository = StarringRepository(context: container.mainContext)
    }

    override func tearDown() {
        container = nil
        repository = nil
        super.tearDown()
    }

    func testStarringATeamMakesItStarred() {
        XCTAssertFalse(repository.isTeamStarred(MockData.arsenal.id))
        repository.starTeam(MockData.arsenal, competition: MockData.premierLeague)
        XCTAssertTrue(repository.isTeamStarred(MockData.arsenal.id))
    }

    func testStarringTheSameTeamTwiceDoesNotDuplicate() {
        repository.starTeam(MockData.arsenal, competition: MockData.premierLeague)
        repository.starTeam(MockData.arsenal, competition: MockData.premierLeague)
        XCTAssertEqual(repository.allStarredTeams().count, 1)
    }

    func testUnstarringATeamRemovesIt() {
        repository.starTeam(MockData.arsenal, competition: MockData.premierLeague)
        repository.unstarTeam(MockData.arsenal.id)
        XCTAssertFalse(repository.isTeamStarred(MockData.arsenal.id))
        XCTAssertTrue(repository.allStarredTeams().isEmpty)
    }

    func testUnstarringATeamThatWasNeverStarredIsANoOp() {
        repository.unstarTeam(999)
        XCTAssertTrue(repository.allStarredTeams().isEmpty)
    }

    func testStarringAMatchMakesItStarred() {
        let match = MockData.matches[0]
        XCTAssertFalse(repository.isMatchStarred(match.id))
        repository.starMatch(match)
        XCTAssertTrue(repository.isMatchStarred(match.id))
    }

    func testUnstarringAMatchRemovesIt() {
        let match = MockData.matches[0]
        repository.starMatch(match)
        repository.unstarMatch(match.id)
        XCTAssertFalse(repository.isMatchStarred(match.id))
    }

    func testToggleTeamMuteFlipsState() {
        repository.starTeam(MockData.arsenal, competition: MockData.premierLeague)
        XCTAssertFalse(repository.starredTeam(MockData.arsenal.id)!.isMuted)
        repository.toggleTeamMute(MockData.arsenal.id)
        XCTAssertTrue(repository.starredTeam(MockData.arsenal.id)!.isMuted)
        repository.toggleTeamMute(MockData.arsenal.id)
        XCTAssertFalse(repository.starredTeam(MockData.arsenal.id)!.isMuted)
    }

    func testMatchInvolvingStarredTeamIsEligibleForNotifications() {
        repository.starTeam(MockData.arsenal, competition: MockData.premierLeague)
        let match = MockData.matches.first { $0.involves(teamID: MockData.arsenal.id) }!
        XCTAssertTrue(repository.isEligibleForNotifications(match))
    }

    func testMatchInvolvingAMutedStarredTeamIsNotEligible() {
        repository.starTeam(MockData.arsenal, competition: MockData.premierLeague)
        repository.toggleTeamMute(MockData.arsenal.id)
        let match = MockData.matches.first { $0.involves(teamID: MockData.arsenal.id) }!
        XCTAssertFalse(repository.isEligibleForNotifications(match))
    }

    func testIndividuallyStarredMatchIsEligibleEvenWithoutStarredTeam() {
        let match = MockData.matches[0]
        repository.starMatch(match)
        XCTAssertTrue(repository.isEligibleForNotifications(match))
    }

    func testUnrelatedMatchIsNotEligible() {
        let match = MockData.matches[0]
        XCTAssertFalse(repository.isEligibleForNotifications(match))
    }
}
