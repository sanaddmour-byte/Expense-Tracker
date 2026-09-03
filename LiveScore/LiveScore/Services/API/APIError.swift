import Foundation

enum APIError: LocalizedError, Equatable {
    case network(String)
    case decoding(String)
    case unauthorized
    case rateLimited
    case notFound
    case unknown(Int)

    var errorDescription: String? {
        switch self {
        case .network(let message):
            return "Network error: \(message)"
        case .decoding(let message):
            return "Failed to parse server response: \(message)"
        case .unauthorized:
            return "Invalid or missing API key."
        case .rateLimited:
            return "Rate limit exceeded. Please try again shortly."
        case .notFound:
            return "The requested resource was not found."
        case .unknown(let statusCode):
            return "Unexpected server error (\(statusCode))."
        }
    }

    var isRetryable: Bool {
        switch self {
        case .network, .rateLimited, .unknown:
            return true
        case .decoding, .unauthorized, .notFound:
            return false
        }
    }
}
