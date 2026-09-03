import Foundation
import Combine

@MainActor
final class TeamProfileViewModel: ObservableObject {
    enum ViewState: Equatable {
        case loading
        case loaded
        case error(String)
    }

    let teamID: Int
    @Published private(set) var state: ViewState = .loading
    @Published private(set) var profile: TeamProfile?

    private let matchRepository: MatchRepositoryProtocol

    init(teamID: Int, matchRepository: MatchRepositoryProtocol) {
        self.teamID = teamID
        self.matchRepository = matchRepository
    }

    func load() async {
        state = .loading
        do {
            profile = try await matchRepository.teamProfile(teamID: teamID)
            state = .loaded
        } catch {
            state = .error(error.localizedDescription)
        }
    }
}
