import Foundation
import SwiftData

enum PersistenceController {
    static let schema = Schema([StarredTeam.self, StarredMatch.self, UserSettings.self])

    static func makeContainer(inMemory: Bool = false) -> ModelContainer {
        let configuration = ModelConfiguration(isStoredInMemoryOnly: inMemory)
        do {
            return try ModelContainer(for: schema, configurations: [configuration])
        } catch {
            fatalError("Failed to create SwiftData ModelContainer: \(error)")
        }
    }

    /// Fetches the singleton settings row, creating it on first launch.
    @MainActor
    static func fetchOrCreateSettings(in context: ModelContext) -> UserSettings {
        let descriptor = FetchDescriptor<UserSettings>(predicate: #Predicate { $0.id == "singleton" })
        if let existing = try? context.fetch(descriptor).first {
            return existing
        }
        let settings = UserSettings()
        context.insert(settings)
        return settings
    }
}
