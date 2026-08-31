import Foundation
import BackgroundTasks

/// MVP stand-in for server-pushed APNs: periodically wakes the app in the background via
/// BGTaskScheduler, fetches the latest matches, and lets ``NotificationCoordinator`` decide
/// what to notify about. Register once at launch; re-schedule after every run so the chain
/// continues. When a real push backend exists, this can be dropped in favor of silent
/// remote notifications without touching ``NotificationCoordinator`` or the trigger engine.
@MainActor
final class BackgroundTaskManager {
    private let coordinator: NotificationCoordinator
    private let taskIdentifier = AppConfig.backgroundRefreshTaskIdentifier

    init(coordinator: NotificationCoordinator) {
        self.coordinator = coordinator
    }

    func registerTask() {
        BGTaskScheduler.shared.register(forTaskWithIdentifier: taskIdentifier, using: nil) { [weak self] task in
            guard let self, let refreshTask = task as? BGAppRefreshTask else {
                task.setTaskCompleted(success: false)
                return
            }
            self.handle(refreshTask)
        }
    }

    func scheduleNextRefresh() {
        let request = BGAppRefreshTaskRequest(identifier: taskIdentifier)
        request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60)
        do {
            try BGTaskScheduler.shared.submit(request)
        } catch {
            Log.notifications.error("Failed to schedule background refresh: \(error.localizedDescription)")
        }
    }

    private func handle(_ task: BGAppRefreshTask) {
        scheduleNextRefresh()

        let work = Task {
            await coordinator.checkForUpdates()
            task.setTaskCompleted(success: true)
        }

        task.expirationHandler = {
            work.cancel()
        }
    }
}
