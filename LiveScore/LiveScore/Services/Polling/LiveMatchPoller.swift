import Foundation
import Combine

/// Polls for live match updates on a fixed interval while the app is in the foreground.
/// Publishes the latest snapshot so any number of view models can subscribe without each
/// running their own timer/network call.
@MainActor
final class LiveMatchPoller: ObservableObject {
    @Published private(set) var latestMatches: [Match] = []

    private let matchRepository: MatchRepositoryProtocol
    private let interval: TimeInterval
    private var pollingTask: Task<Void, Never>?

    /// Set by ``ServiceContainer`` once the notification coordinator exists, so every
    /// foreground refresh also evaluates starred matches for notification-worthy changes.
    var onMatchesUpdated: (([Match]) -> Void)?

    init(matchRepository: MatchRepositoryProtocol, interval: TimeInterval = AppConfig.liveMatchPollIntervalSeconds) {
        self.matchRepository = matchRepository
        self.interval = interval
    }

    func start() {
        guard pollingTask == nil else { return }
        pollingTask = Task { [weak self] in
            guard let self else { return }
            while !Task.isCancelled {
                await self.refresh()
                try? await Task.sleep(for: .seconds(self.interval))
            }
        }
    }

    func stop() {
        pollingTask?.cancel()
        pollingTask = nil
    }

    func refresh() async {
        guard let fetched = try? await matchRepository.matches(on: Date()) else { return }
        latestMatches = fetched
        onMatchesUpdated?(fetched)
    }
}
