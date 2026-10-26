import type { Suggestion } from '../mock-data';
import { SuggestionChip } from './suggestion-chip';

export function SuggestionChips({
	suggestions,
}: {
	suggestions: Suggestion[];
}) {
	return (
		<ul
			aria-label="Suggested next steps"
			className="flex flex-wrap justify-center gap-2"
		>
			{suggestions.map((suggestion) => (
				<li key={suggestion.href}>
					<SuggestionChip suggestion={suggestion} />
				</li>
			))}
		</ul>
	);
}
