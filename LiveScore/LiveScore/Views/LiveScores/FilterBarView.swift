import SwiftUI

struct FilterBarView: View {
    @Binding var selected: MatchFeedFilter

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Theme.Spacing.sm) {
                ForEach(MatchFeedFilter.allCases) { filter in
                    Button {
                        selected = filter
                    } label: {
                        Text(filter.rawValue)
                            .font(.subheadline.weight(.medium))
                            .padding(.horizontal, Theme.Spacing.md)
                            .padding(.vertical, Theme.Spacing.sm)
                            .background(
                                selected == filter ? Theme.Colors.pitchGreen : Theme.Colors.cardBackground,
                                in: Capsule()
                            )
                            .foregroundStyle(selected == filter ? .white : Theme.Colors.textPrimary)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, Theme.Spacing.lg)
        }
    }
}
