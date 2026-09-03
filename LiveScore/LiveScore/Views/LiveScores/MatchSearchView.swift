import SwiftUI

struct MatchSearchModifier: ViewModifier {
    @Binding var text: String

    func body(content: Content) -> some View {
        content.searchable(text: $text, prompt: "Search teams or competitions")
    }
}

extension View {
    func matchSearchable(text: Binding<String>) -> some View {
        modifier(MatchSearchModifier(text: text))
    }
}
