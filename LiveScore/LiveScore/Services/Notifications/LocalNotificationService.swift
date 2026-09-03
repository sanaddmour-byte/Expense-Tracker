import Foundation
import UserNotifications

/// MVP notification delivery: schedules local notifications via UNUserNotificationCenter.
/// The `matchID` is carried in `userInfo` so a tap can deep-link straight to the match —
/// see `NotificationRouter`. Swapping to real APNs later only means replacing this type
/// with one that talks to a push token registry; ``NotificationServiceProtocol`` stays put.
final class LocalNotificationService: NotificationServiceProtocol {
    private let center: UNUserNotificationCenter

    init(center: UNUserNotificationCenter = .current()) {
        self.center = center
    }

    @discardableResult
    func requestAuthorizationIfNeeded() async -> Bool {
        let settings = await center.notificationSettings()
        switch settings.authorizationStatus {
        case .authorized, .provisional, .ephemeral:
            return true
        case .notDetermined:
            do {
                return try await center.requestAuthorization(options: [.alert, .sound, .badge])
            } catch {
                Log.notifications.error("Failed to request authorization: \(error.localizedDescription)")
                return false
            }
        case .denied:
            return false
        @unknown default:
            return false
        }
    }

    func deliver(_ notification: PendingNotification) async {
        let content = UNMutableNotificationContent()
        content.title = notification.title
        content.body = notification.body
        content.sound = .default
        content.userInfo = ["matchID": notification.matchID, "eventType": notification.eventType.rawValue]

        let request = UNNotificationRequest(identifier: notification.identifier, content: content, trigger: nil)
        do {
            try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
                center.add(request) { error in
                    if let error {
                        continuation.resume(throwing: error)
                    } else {
                        continuation.resume()
                    }
                }
            }
        } catch {
            Log.notifications.error("Failed to deliver notification \(notification.identifier): \(error.localizedDescription)")
        }
    }
}
