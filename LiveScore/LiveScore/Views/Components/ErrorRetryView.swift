import SwiftUI

struct ErrorRetryView: View {
    let message: String
    let retryAction: () -> Void

    var body: some View {
        VStack(spacing: Theme.Spacing.md) {
            Image(systemName: "wifi.exclamationmark")
                .font(.system(size: 40))
                .foregroundStyle(Theme.Colors.textSecondary)
            Text("Something went wrong")
                .font(.headline)
            Text(message)
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.Spacing.xl)
            Button(action: retryAction) {
                Label("Retry", systemImage: "arrow.clockwise")
                    .font(.subheadline.bold())
                    .padding(.horizontal, Theme.Spacing.lg)
                    .padding(.vertical, Theme.Spacing.sm)
            }
            .buttonStyle(.borderedProminent)
            .tint(Theme.Colors.pitchGreen)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }
}
