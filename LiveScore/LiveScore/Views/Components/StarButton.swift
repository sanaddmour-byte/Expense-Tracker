import SwiftUI

struct StarButton: View {
    let isStarred: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: isStarred ? "star.fill" : "star")
                .foregroundStyle(isStarred ? Theme.Colors.accentYellow : Theme.Colors.textSecondary)
                .imageScale(.large)
                .contentTransition(.symbolEffect(.replace))
        }
        .buttonStyle(.plain)
        .accessibilityLabel(isStarred ? "Unstar" : "Star")
    }
}
