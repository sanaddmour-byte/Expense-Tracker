import SwiftUI

struct TeamLogoView: View {
    let team: Team
    var size: CGFloat = 32

    var body: some View {
        AsyncImage(url: team.crestURL) { phase in
            switch phase {
            case .success(let image):
                image.resizable().scaledToFit()
            default:
                placeholder
            }
        }
        .frame(width: size, height: size)
    }

    private var placeholder: some View {
        Circle()
            .fill(Theme.Colors.pitchGreen.opacity(0.15))
            .overlay(
                Text(team.shortName.prefix(3))
                    .font(.system(size: size * 0.32, weight: .bold, design: .rounded))
                    .foregroundStyle(Theme.Colors.pitchGreen)
            )
    }
}
