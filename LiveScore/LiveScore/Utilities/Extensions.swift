import Foundation

extension Array where Element == Match {
    /// Groups matches by competition, preserving the order competitions first appear in.
    func groupedByCompetition() -> [(competition: Competition, matches: [Match])] {
        var order: [Int] = []
        var buckets: [Int: (Competition, [Match])] = [:]
        for match in self {
            if buckets[match.competition.id] == nil {
                order.append(match.competition.id)
                buckets[match.competition.id] = (match.competition, [])
            }
            buckets[match.competition.id]?.1.append(match)
        }
        return order.compactMap { buckets[$0] }
    }
}
