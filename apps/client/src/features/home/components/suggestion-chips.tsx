'use client';

import { usePendingQuestionCount } from '@/features/questions/hooks';
import { suggestionsFor } from '../suggestions';
import { SuggestionChip } from './suggestion-chip';

// today's review is not a chip: the Today card under the message box lists it
export function SuggestionChips() {
	const pendingApproval = usePendingQuestionCount() ?? 0;
	const suggestions = suggestionsFor({ pendingApproval });
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
