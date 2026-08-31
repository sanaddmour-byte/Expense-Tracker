import Foundation
import Combine

@MainActor
final class LiveScoresViewModel: ObservableObject {
    enum ViewState: Equatable {
        case loading
        case loaded
        case error(String)
    }

    @Published private(set) var state: ViewState = .loading
    @Published private(set) var matches: [Match] = []
    @Published var selectedFilter: MatchFeedFilter = .all
    @Published var searchText: String = ""

    private let matchRepository: MatchRepositoryProtocol
    private let poller: LiveMatchPoller
    private var cancellables: Set<AnyCancellable> = []

    init(matchRepository: MatchRepositoryProtocol, poller: LiveMatchPoller) {
        self.matchRepository = matchRepository
        self.poller = poller

        poller.$latestMatches
            .dropFirst()
            .receive(on: DispatchQueue.main)
            .sink { [weak self] fetched in
                guard let self, !fetched.isEmpty else { return }
                self.matches = fetched
                self.state = .loaded
            }
            .store(in: &cancellables)
    }

    var filteredMatches: [Match] {
        let byFilter = matches.filter { selectedFilter.matches($0) }
        guard !searchText.isEmpty else { return byFilter }
        return byFilter.filter {
            $0.homeTeam.name.localizedCaseInsensitiveContains(searchText) ||
            $0.awayTeam.name.localizedCaseInsensitiveContains(searchText) ||
            $0.competition.name.localizedCaseInsensitiveContains(searchText)
        }
    }

    var groupedMatches: [(competition: Competition, matches: [Match])] {
        filteredMatches.groupedByCompetition()
    }

    func onAppear() {
        poller.start()
        Task { await load() }
    }

    func onDisappear() {
        poller.stop()
    }

    func load() async {
        if matches.isEmpty { state = .loading }
        do {
            matches = try await matchRepository.matches(on: Date())
            state = .loaded
        } catch {
            state = .error(error.localizedDescription)
        }
    }

    func refresh() async {
        await load()
    }
}
