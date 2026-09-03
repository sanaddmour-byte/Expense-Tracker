import Foundation

/// Persists the last-seen state of each match between polling cycles (foreground timer or
/// background task), so ``NotificationTriggerEngine`` has a "previous" snapshot to diff
/// against even across app relaunches. Backed by UserDefaults — the data is small and
/// short-lived (cleared for matches that finished more than a day ago).
final class MatchSnapshotStore {
    private let defaults: UserDefaults
    private let storageKey = "com.livescore.app.matchSnapshots"

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
    }

    func snapshot(for matchID: Int) -> Match? {
        allSnapshots()[matchID]
    }

    func save(_ match: Match) {
        var all = allSnapshots()
        all[match.id] = match
        persist(all)
    }

    func purgeStaleSnapshots(olderThan cutoff: Date) {
        let filtered = allSnapshots().filter { $0.value.kickoff > cutoff }
        persist(filtered)
    }

    private func allSnapshots() -> [Int: Match] {
        guard let data = defaults.data(forKey: storageKey),
              let decoded = try? JSONDecoder().decode([Int: Match].self, from: data) else {
            return [:]
        }
        return decoded
    }

    private func persist(_ snapshots: [Int: Match]) {
        guard let data = try? JSONEncoder().encode(snapshots) else { return }
        defaults.set(data, forKey: storageKey)
    }
}
