import Foundation
import Combine

@MainActor
final class MatchDetailViewModel: ObservableObject {
    enum Tab: String, CaseIterable, Identifiable {
        case timeline = "Timeline"
        case lineups = "Lineups"
        case stats = "Stats"
        case h2h = "H2H"

        var id: String { rawValue }
    }

    @Published private(set) var match: Match
    @Published var selectedTab: Tab = .timeline
    @Published private(set) var statistics: MatchStatistics?
    @Published private(set) var lineups: MatchLineups?
    @Published private(set) var headToHead: HeadToHeadRecord?
    @Published private(set) var isLoadingDetails = false
    @Published private(set) var errorMessage: String?

    private let matchRepository: MatchRepositoryProtocol
    private var refreshTask: Task<Void, Never>?

    init(match: Match, matchRepository: MatchRepositoryProtocol) {
        self.match = match
        self.matchRepository = matchRepository
    }

    func onAppear() {
        Task { await loadDetails() }
        if match.isLive {
            startAutoRefresh()
        }
    }

    func onDisappear() {
        refreshTask?.cancel()
        refreshTask = nil
    }

    func loadDetails() async {
        isLoadingDetails = true
        errorMessage = nil
        async let statsResult = matchRepository.statistics(matchID: match.id)
        async let lineupsResult = matchRepository.lineups(matchID: match.id)
        async let h2hResult = matchRepository.headToHead(homeTeamID: match.homeTeam.id, awayTeamID: match.awayTeam.id)
        do {
            statistics = try await statsResult
            lineups = try await lineupsResult
            headToHead = try await h2hResult
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoadingDetails = false
    }

    private func startAutoRefresh() {
        refreshTask?.cancel()
        refreshTask = Task { [weak self] in
            guard let self else { return }
            while !Task.isCancelled && self.match.isLive {
                try? await Task.sleep(for: .seconds(AppConfig.liveMatchPollIntervalSeconds))
                await self.refreshMatch()
            }
        }
    }

    private func refreshMatch() async {
        guard let updated = try? await matchRepository.match(id: match.id) else { return }
        match = updated
        if !match.isLive {
            refreshTask?.cancel()
        }
    }
}
