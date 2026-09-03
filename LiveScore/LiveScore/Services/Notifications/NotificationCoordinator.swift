import Foundation
import SwiftData

/// Orchestrates one "check for updates and notify" cycle: fetch matches, diff each starred
/// match against its last-known snapshot, and deliver whatever the trigger engine decides.
/// Called from both the foreground poller and the background-task handler so the two paths
/// share identical logic.
@MainActor
final class NotificationCoordinator {
    private let matchRepository: MatchRepositoryProtocol
    private let notificationService: NotificationServiceProtocol
    private let snapshotStore: MatchSnapshotStore
    private let modelContainer: ModelContainer

    init(
        matchRepository: MatchRepositoryProtocol,
        notificationService: NotificationServiceProtocol,
        snapshotStore: MatchSnapshotStore = MatchSnapshotStore(),
        modelContainer: ModelContainer
    ) {
        self.matchRepository = matchRepository
        self.notificationService = notificationService
        self.snapshotStore = snapshotStore
        self.modelContainer = modelContainer
    }

    func checkForUpdates() async {
        guard let matches = try? await matchRepository.matches(on: Date()) else { return }
        await evaluate(matches: matches)
    }

    /// Same evaluation logic as ``checkForUpdates()``, but for matches already fetched
    /// elsewhere (e.g. by the foreground live poller), to avoid a duplicate network call.
    func evaluate(matches: [Match]) async {
        let context = modelContainer.mainContext
        let starringRepository = StarringRepository(context: context)
        let settings = PersistenceController.fetchOrCreateSettings(in: context)
        let engine = NotificationTriggerEngine(enabledEvents: settings.enabledNotificationEvents)

        for match in matches {
            guard starringRepository.isEligibleForNotifications(match) else { continue }
            let previous = snapshotStore.snapshot(for: match.id)
            let pending = engine.notifications(previous: previous, current: match, isEligible: true)
            for notification in pending {
                await notificationService.deliver(notification)
            }
            snapshotStore.save(match)
        }

        snapshotStore.purgeStaleSnapshots(olderThan: Calendar.current.date(byAdding: .day, value: -1, to: Date()) ?? Date())
    }
}
