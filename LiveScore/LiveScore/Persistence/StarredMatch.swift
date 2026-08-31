import Foundation
import SwiftData

@Model
final class StarredMatch {
    @Attribute(.unique) var matchID: Int
    var homeTeamName: String
    var awayTeamName: String
    var competitionName: String
    var kickoff: Date
    var dateAdded: Date

    init(
        matchID: Int,
        homeTeamName: String,
        awayTeamName: String,
        competitionName: String,
        kickoff: Date,
        dateAdded: Date = Date()
    ) {
        self.matchID = matchID
        self.homeTeamName = homeTeamName
        self.awayTeamName = awayTeamName
        self.competitionName = competitionName
        self.kickoff = kickoff
        self.dateAdded = dateAdded
    }
}
