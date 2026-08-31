import Foundation

/// Reads build-time configuration (injected via xcconfig -> Info.plist) and exposes it
/// as a typed, testable surface. No API keys are ever hardcoded here.
enum AppConfig {
    enum DataSourceMode: String {
        case auto = "AUTO"
        case mock = "MOCK"
        case live = "LIVE"
    }

    static var footballDataKey: String {
        infoPlistString(for: "FOOTBALL_DATA_KEY")
    }

    static var dataSourceMode: DataSourceMode {
        DataSourceMode(rawValue: infoPlistString(for: "DATA_SOURCE_MODE")) ?? .auto
    }

    /// Whether the app should use the bundled mock data provider instead of hitting a live API.
    static var useMockData: Bool {
        switch dataSourceMode {
        case .mock: return true
        case .live: return false
        case .auto: return footballDataKey.isEmpty
        }
    }

    static let footballDataBaseURL = URL(string: "https://api.football-data.org/v4")!
    static let backgroundRefreshTaskIdentifier = "com.livescore.app.refresh"
    static let liveMatchPollIntervalSeconds: TimeInterval = 20

    private static func infoPlistString(for key: String) -> String {
        guard let value = Bundle.main.object(forInfoDictionaryKey: key) as? String else { return "" }
        // Unresolved xcconfig substitutions (e.g. when a key is left blank) surface as "$(KEY)".
        if value.hasPrefix("$(") || value.isEmpty { return "" }
        return value
    }
}
