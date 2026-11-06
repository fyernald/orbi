import { routes } from '@/lib/routes';

export type SuggestionTone = 'primary' | 'warning';

export type Suggestion = {
	label: string;
	href: string;
	tone: SuggestionTone;
};

// only shows what needs doing, so a student who is caught up sees no chips
export function suggestionsFor({
	pendingApproval,
}: {
	pendingApproval: number;
}): Suggestion[] {
	const suggestions: Suggestion[] = [];
	if (pendingApproval > 0) {
		suggestions.push({
			label: `Approve ${pendingApproval} new ${pendingApproval === 1 ? 'question' : 'questions'}`,
			href: routes.review,
			tone: 'warning',
		});
	}
	return suggestions;
}
