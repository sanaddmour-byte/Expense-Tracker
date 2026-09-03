import os

enum Log {
    static let network = Logger(subsystem: "com.livescore.app", category: "network")
    static let notifications = Logger(subsystem: "com.livescore.app", category: "notifications")
    static let persistence = Logger(subsystem: "com.livescore.app", category: "persistence")
}
