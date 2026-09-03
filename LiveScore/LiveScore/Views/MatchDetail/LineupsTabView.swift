import SwiftUI

struct LineupsTabView: View {
    let lineups: MatchLineups?
    let homeTeam: Team
    let awayTeam: Team

    var body: some View {
        if let lineups {
            VStack(spacing: Theme.Spacing.lg) {
                formationHeader(lineups)
                pitchView(lineups)
                benchSection(title: homeTeam.name, players: lineups.home.substitutes)
                benchSection(title: awayTeam.name, players: lineups.away.substitutes)
            }
            .padding(Theme.Spacing.lg)
        } else {
            EmptyStateView(symbol: "sportscourt", title: "Lineups unavailable", message: "Lineups aren't published for this match yet.")
        }
    }

    private func formationHeader(_ lineups: MatchLineups) -> some View {
        HStack {
            VStack(alignment: .leading) {
                Text(homeTeam.name).font(.subheadline.weight(.semibold))
                Text(lineups.home.formation).font(.caption).foregroundStyle(Theme.Colors.textSecondary)
            }
            Spacer()
            VStack(alignment: .trailing) {
                Text(awayTeam.name).font(.subheadline.weight(.semibold))
                Text(lineups.away.formation).font(.caption).foregroundStyle(Theme.Colors.textSecondary)
            }
        }
    }

    private func pitchView(_ lineups: MatchLineups) -> some View {
        GeometryReader { geometry in
            ZStack {
                RoundedRectangle(cornerRadius: Theme.Radius.card)
                    .fill(Theme.Colors.pitchGreen.opacity(0.85))
                pitchMarkings

                ForEach(lineups.home.startingXI) { player in
                    playerDot(player, in: geometry.size, flipped: false)
                }
                ForEach(lineups.away.startingXI) { player in
                    playerDot(player, in: geometry.size, flipped: true)
                }
            }
        }
        .aspectRatio(1.5, contentMode: .fit)
        .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.card))
    }

    private var pitchMarkings: some View {
        GeometryReader { geometry in
            Path { path in
                let midX = geometry.size.width / 2
                path.move(to: CGPoint(x: midX, y: 0))
                path.addLine(to: CGPoint(x: midX, y: geometry.size.height))
            }
            .stroke(.white.opacity(0.4), lineWidth: 1)
        }
    }

    private func playerDot(_ player: LineupPlayer, in size: CGSize, flipped: Bool) -> some View {
        let x = flipped ? (1 - player.position.x) * size.width : player.position.x * size.width
        let y = player.position.y * size.height
        return VStack(spacing: 2) {
            ZStack {
                Circle().fill(.white).frame(width: 26, height: 26)
                Text("\(player.shirtNumber)")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundStyle(Theme.Colors.pitchGreen)
            }
            if player.isCaptain {
                Text("C").font(.system(size: 8, weight: .bold)).foregroundStyle(Theme.Colors.accentYellow)
            }
        }
        .position(x: x, y: y)
    }

    private func benchSection(title: String, players: [LineupPlayer]) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            Text("\(title) Substitutes")
                .font(.subheadline.weight(.semibold))
            ForEach(players) { player in
                HStack {
                    Text("\(player.shirtNumber)")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(Theme.Colors.pitchGreen)
                        .frame(width: 24)
                    Text(player.name).font(.subheadline)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
