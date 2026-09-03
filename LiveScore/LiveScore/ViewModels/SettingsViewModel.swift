import Foundation
import Combine
import SwiftData

@MainActor
final class SettingsViewModel: ObservableObject {
    private let context: ModelContext
    private let settings: UserSettings

    @Published var appearanceMode: AppearanceMode {
        didSet { settings.appearanceMode = appearanceMode }
    }
    @Published var enabledNotificationEvents: Set<NotificationEventType> {
        didSet { settings.enabledNotificationEvents = enabledNotificationEvents }
    }

    init(context: ModelContext) {
        self.context = context
        let settings = PersistenceController.fetchOrCreateSettings(in: context)
        self.settings = settings
        self.appearanceMode = settings.appearanceMode
        self.enabledNotificationEvents = settings.enabledNotificationEvents
    }

    func isEventEnabled(_ event: NotificationEventType) -> Bool {
        enabledNotificationEvents.contains(event)
    }

    func toggleEvent(_ event: NotificationEventType) {
        if enabledNotificationEvents.contains(event) {
            enabledNotificationEvents.remove(event)
        } else {
            enabledNotificationEvents.insert(event)
        }
    }

    func togglePreferredCompetition(_ competitionID: Int) {
        var ids = Set(settings.preferredCompetitionIDs)
        if ids.contains(competitionID) {
            ids.remove(competitionID)
        } else {
            ids.insert(competitionID)
        }
        settings.preferredCompetitionIDs = Array(ids)
        objectWillChange.send()
    }

    func isPreferredCompetition(_ competitionID: Int) -> Bool {
        settings.preferredCompetitionIDs.isEmpty || settings.preferredCompetitionIDs.contains(competitionID)
    }

    var hasAnyPreferredCompetitions: Bool {
        !settings.preferredCompetitionIDs.isEmpty
    }
}
