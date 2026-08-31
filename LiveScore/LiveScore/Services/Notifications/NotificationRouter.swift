import Foundation
import Combine

/// Bridges a tapped notification to in-app navigation. `UNUserNotificationCenterDelegate`
/// callbacks land here (see `LiveScoreApp`), and `RootTabView` observes `pendingMatchID`
/// to push the right match detail screen.
@MainActor
final class NotificationRouter: ObservableObject {
    @Published var pendingMatchID: Int?

    func handle(userInfo: [AnyHashable: Any]) {
        guard let matchID = userInfo["matchID"] as? Int else { return }
        pendingMatchID = matchID
    }
}
