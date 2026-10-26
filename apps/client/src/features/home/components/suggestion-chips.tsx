import type { Suggestion } from '../suggestions';
import { SuggestionChip } from './suggestion-chip';

export function SuggestionChips({
	suggestions,
}: {
	suggestions: Suggestion[];
}) {
	if (suggestions.length === 0) return null;

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
