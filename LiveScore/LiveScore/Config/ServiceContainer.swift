import Foundation
import SwiftData

/// Minimal dependency-injection container. View models receive their dependencies through
/// initializers (never by reaching into this container directly), which keeps them mockable
/// in tests; this type only exists to build the "real" graph once at app launch.
@MainActor
final class ServiceContainer {
    let matchRepository: MatchRepositoryProtocol
    let notificationService: NotificationServiceProtocol
    let liveMatchPoller: LiveMatchPoller
    let notificationCoordinator: NotificationCoordinator
    let backgroundTaskManager: BackgroundTaskManager
    let modelContainer: ModelContainer

    init(modelContainer: ModelContainer) {
        self.modelContainer = modelContainer

        let apiClient: FootballAPIClient = AppConfig.useMockData
            ? MockFootballAPIClient()
            : FootballDataOrgClient()
        let repository = MatchRepository(client: apiClient)
        self.matchRepository = repository

        let notifications = LocalNotificationService()
        self.notificationService = notifications

        self.liveMatchPoller = LiveMatchPoller(matchRepository: repository)

        let coordinator = NotificationCoordinator(
            matchRepository: repository,
            notificationService: notifications,
            modelContainer: modelContainer
        )
        self.notificationCoordinator = coordinator
        self.backgroundTaskManager = BackgroundTaskManager(coordinator: coordinator)

        self.liveMatchPoller.onMatchesUpdated = { [coordinator] matches in
            Task { await coordinator.evaluate(matches: matches) }
        }
    }

    func makeStarringRepository() -> StarringRepository {
        StarringRepository(context: modelContainer.mainContext)
    }
}
