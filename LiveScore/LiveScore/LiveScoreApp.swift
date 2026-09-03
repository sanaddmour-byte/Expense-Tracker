import SwiftUI
import UserNotifications

@main
struct LiveScoreApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    private let modelContainer = PersistenceController.makeContainer()
    private let services: ServiceContainer

    init() {
        let container = ServiceContainer(modelContainer: modelContainer)
        services = container
        AppDelegate.services = container
    }

    var body: some Scene {
        WindowGroup {
            RootTabView(modelContainer: modelContainer)
                .environment(\.services, services)
                .environmentObject(AppDelegate.notificationRouter)
        }
        .modelContainer(modelContainer)
    }
}

/// Hosts the two pieces of setup that only exist on `UIApplicationDelegate`: registering
/// the background-refresh task before `application(_:didFinishLaunchingWithOptions:)`
/// returns, and receiving notification-tap callbacks for deep linking.
@MainActor
final class AppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    static var services: ServiceContainer?
    static let notificationRouter = NotificationRouter()

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        UNUserNotificationCenter.current().delegate = self

        if let services = Self.services {
            services.backgroundTaskManager.registerTask()
            services.backgroundTaskManager.scheduleNextRefresh()
        }

        return true
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification
    ) async -> UNNotificationPresentationOptions {
        [.banner, .sound, .badge]
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse
    ) async {
        Self.notificationRouter.handle(userInfo: response.notification.request.content.userInfo)
    }
}
