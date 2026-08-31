import Foundation
import SwiftData

@Model
final class StarredTeam {
    @Attribute(.unique) var teamID: Int
    var teamName: String
    var crestURLString: String?
    var competitionID: Int
    var competitionName: String
    var dateAdded: Date
    /// Per-team mute: when true, this team's matches never trigger notifications
    /// even though the team itself remains starred.
    var isMuted: Bool

    init(
        teamID: Int,
        teamName: String,
        crestURLString: String?,
        competitionID: Int,
        competitionName: String,
        dateAdded: Date = Date(),
        isMuted: Bool = false
    ) {
        self.teamID = teamID
        self.teamName = teamName
        self.crestURLString = crestURLString
        self.competitionID = competitionID
        self.competitionName = competitionName
        self.dateAdded = dateAdded
        self.isMuted = isMuted
    }
}
