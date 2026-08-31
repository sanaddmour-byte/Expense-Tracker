import Foundation

struct Competition: Identifiable, Hashable, Codable, Sendable {
    let id: Int
    let name: String
    let country: String
    let emblemURL: URL?
}
