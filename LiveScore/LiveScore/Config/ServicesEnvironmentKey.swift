import SwiftUI
import SwiftData

private struct ServicesEnvironmentKey: EnvironmentKey {
    /// Fallback used by SwiftUI previews / anywhere the app root hasn't injected a real
    /// container yet. Always backed by mock data and an in-memory store.
    static let defaultValue: ServiceContainer = ServiceContainer(
        modelContainer: PersistenceController.makeContainer(inMemory: true)
    )
}

extension EnvironmentValues {
    var services: ServiceContainer {
        get { self[ServicesEnvironmentKey.self] }
        set { self[ServicesEnvironmentKey.self] = newValue }
    }
}
