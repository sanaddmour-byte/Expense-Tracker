import Foundation
import Combine

@MainActor
final class FollowingViewModel: ObservableObject {
    @Published private(set) var matches: [Match] = []
    @Published private(set) var isLoading = false
    @Published private(set) var errorMessage: String?

    private let matchRepository: MatchRepositoryProtocol

    init(matchRepository: MatchRepositoryProtocol) {
        self.matchRepository = matchRepository
    }

    func load() async {
        isLoading = true
        errorMessage = nil
        do {
            matches = try await matchRepository.matches(on: Date())
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    /// Matches to show given the current starred teams/matches: any match involving a
    /// starred team, plus any individually starred match, deduped and sorted by kickoff.
    func followedMatches(starredTeamIDs: Set<Int>, starredMatchIDs: Set<Int>) -> [Match] {
        matches
            .filter { starredMatchIDs.contains($0.id) || starredTeamIDs.contains($0.homeTeam.id) || starredTeamIDs.contains($0.awayTeam.id) }
            .sorted { $0.kickoff < $1.kickoff }
    }
}
