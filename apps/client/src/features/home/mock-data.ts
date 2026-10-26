import { routes } from '@/lib/routes';

// mock data until the API is ready; replace with query hooks in hooks.ts

export type SuggestionTone = 'primary' | 'amber' | 'neutral';

export type Suggestion = {
	label: string;
	href: string;
	tone: SuggestionTone;
};

export const nextUp = {
	headline: 'Ready to continue Biology 101?',
	course: 'Biology 101',
	topic: 'Meiosis & crossing over',
};

export const suggestions: Suggestion[] = [
	{
		label: 'Start today’s review · 24 due',
		href: routes.studySession,
		tone: 'primary',
	},
	{ label: 'Approve 6 new questions', href: routes.review, tone: 'amber' },
	{ label: 'Mock exam for Saturday', href: routes.mockExams, tone: 'neutral' },
];
