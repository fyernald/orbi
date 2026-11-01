'use client';

import { usePendingQuestionCount } from '@/features/questions/hooks';
import { suggestionsFor } from '../suggestions';
import { SuggestionChip } from './suggestion-chip';

export function SuggestionChips({ dueCount }: { dueCount: number }) {
	const pendingApproval = usePendingQuestionCount() ?? 0;
	const suggestions = suggestionsFor({ dueCount, pendingApproval });
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
