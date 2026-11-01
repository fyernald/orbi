import { routes } from '@/lib/routes';

export type SuggestionTone = 'primary' | 'warning';

export type Suggestion = {
	label: string;
	href: string;
	tone: SuggestionTone;
};

// only shows what needs doing, so a student who is caught up sees no chips
export function suggestionsFor({
	dueCount,
	pendingApproval,
}: {
	dueCount: number;
	pendingApproval: number;
}): Suggestion[] {
	const suggestions: Suggestion[] = [];
	if (dueCount > 0) {
		suggestions.push({
			label: `Start today’s review · ${dueCount} due`,
			href: routes.studySession,
			tone: 'primary',
		});
	}
	if (pendingApproval > 0) {
		suggestions.push({
			label: `Approve ${pendingApproval} new ${pendingApproval === 1 ? 'question' : 'questions'}`,
			href: routes.review,
			tone: 'warning',
		});
	}
	return suggestions;
}
