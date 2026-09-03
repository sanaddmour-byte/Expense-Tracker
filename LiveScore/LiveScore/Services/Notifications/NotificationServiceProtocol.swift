import Foundation

struct PendingNotification: Equatable, Sendable {
    let identifier: String
    let matchID: Int
    let eventType: NotificationEventType
    let title: String
    let body: String
}

/// Abstraction over the notification delivery mechanism. The MVP implementation posts
/// local notifications triggered by foreground polling / background-task wakeups; a
/// future real-APNs backend can conform to the same protocol without any caller changes.
protocol NotificationServiceProtocol: Sendable {
    /// Requests notification permission if not already determined. Should only be called
    /// in response to a user action (e.g. starring a team), never on app launch.
    @discardableResult
    func requestAuthorizationIfNeeded() async -> Bool

    func deliver(_ notification: PendingNotification) async
}
