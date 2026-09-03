import Foundation
import SwiftData

enum AppearanceMode: String, Codable, CaseIterable, Identifiable {
    case system
    case light
    case dark

    var id: String { rawValue }

    var title: String {
        switch self {
        case .system: return "System"
        case .light: return "Light"
        case .dark: return "Dark"
        }
    }
}

/// A singleton settings record. There is always exactly one row, keyed by `id == "singleton"`.
@Model
final class UserSettings {
    @Attribute(.unique) var id: String
    var appearanceModeRaw: String
    /// Notification event types the user has enabled, stored as raw values.
    var enabledNotificationEventsRaw: [String]
    /// Competition IDs the user has marked as preferred, to declutter the main feed.
    /// Empty means "show all competitions".
    var preferredCompetitionIDs: [Int]
    var notificationsRequested: Bool

    init(
        appearanceMode: AppearanceMode = .system,
        enabledNotificationEvents: Set<NotificationEventType> = Set(NotificationEventType.allCases),
        preferredCompetitionIDs: [Int] = [],
        notificationsRequested: Bool = false
    ) {
        self.id = "singleton"
        self.appearanceModeRaw = appearanceMode.rawValue
        self.enabledNotificationEventsRaw = enabledNotificationEvents.map(\.rawValue)
        self.preferredCompetitionIDs = preferredCompetitionIDs
        self.notificationsRequested = notificationsRequested
    }

    var appearanceMode: AppearanceMode {
        get { AppearanceMode(rawValue: appearanceModeRaw) ?? .system }
        set { appearanceModeRaw = newValue.rawValue }
    }

    var enabledNotificationEvents: Set<NotificationEventType> {
        get { Set(enabledNotificationEventsRaw.compactMap(NotificationEventType.init(rawValue:))) }
        set { enabledNotificationEventsRaw = newValue.map(\.rawValue) }
    }
}
