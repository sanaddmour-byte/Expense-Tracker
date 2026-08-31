import SwiftUI

/// Centralized design tokens for LiveScore. Colors are backed by the asset catalog
/// (Assets.xcassets) so light/dark variants are defined in one place and adapt automatically.
enum Theme {
    enum Colors {
        /// Pitch green — primary actions, live indicators, navigation bar.
        static let pitchGreen = Color("PitchGreen")
        /// Accent yellow — badges, star/favorite indicators, notification alerts.
        static let accentYellow = Color("AccentYellow")
        /// Card / surface background.
        static let cardBackground = Color("CardBackground")

        static let liveRed = Color(red: 0.86, green: 0.16, blue: 0.16)
        static let textPrimary = Color.primary
        static let textSecondary = Color.secondary
        static let background = Color(uiColor: .systemGroupedBackground)
        static let divider = Color(uiColor: .separator)
    }

    enum Spacing {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 12
        static let lg: CGFloat = 16
        static let xl: CGFloat = 24
        static let xxl: CGFloat = 32
    }

    enum Radius {
        static let card: CGFloat = 14
        static let badge: CGFloat = 8
        static let pill: CGFloat = 100
    }

    enum Shadow {
        static let color = Color.black.opacity(0.08)
        static let radius: CGFloat = 8
        static let y: CGFloat = 2
    }

    enum Typography {
        static let matchMinute = Font.system(size: 12, weight: .bold, design: .rounded)
        static let score = Font.system(size: 20, weight: .bold, design: .rounded)
        static let teamName = Font.system(size: 15, weight: .medium)
        static let competitionHeader = Font.system(size: 13, weight: .semibold)
        static let cardTitle = Font.headline
    }
}

extension View {
    /// Standard card container styling used across match cards, list rows, and sections.
    func cardStyle() -> some View {
        self
            .background(Theme.Colors.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.card, style: .continuous))
            .shadow(color: Theme.Shadow.color, radius: Theme.Shadow.radius, x: 0, y: Theme.Shadow.y)
    }
}
