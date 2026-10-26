// mock data until the API is ready; replace with query hooks in hooks.ts

export type Topic = {
	id: string;
	course: string;
	name: string;
};

export type TodaySummary = {
	dueCount: number;
	pendingApproval: number;
};

const biology = (id: string, name: string): Topic => ({
	id: `bio-${id}`,
	course: 'Biology 101',
	name,
});

// the first one is the topic the student studied last
export const recentTopics: Topic[] = [
	biology('meiosis', 'Meiosis & crossing over'),
	{ id: 'calc-series', course: 'Calculus II', name: 'Taylor series' },
	biology('mitosis', 'Mitosis & the cell cycle'),
	{
		id: 'eco-inflation',
		course: 'Macroeconomics',
		name: 'Inflation & the CPI',
	},
	biology('membrane', 'Cell membrane transport'),
	biology('dna', 'DNA replication'),
	biology('protein', 'Transcription & translation'),
	biology('mendel', 'Mendelian genetics'),
	biology('photosynthesis', 'Photosynthesis'),
	biology('respiration', 'Cellular respiration'),
	biology('enzymes', 'Enzymes & reaction rates'),
	biology('selection', 'Natural selection'),
];

export const today: TodaySummary = { dueCount: 24, pendingApproval: 6 };

export type ModelFamily = 'gemini' | 'claude';

// stands in for the model catalog (app-patterns rule 6); the default comes from
// the account settings, and the app never switches models by itself
export type AiModel = {
	id: string;
	label: string;
	family: ModelFamily;
	provider: string;
	goodAt: string;
};

export const models: AiModel[] = [
	{
		id: 'gemini-flash',
		label: 'Gemini Flash',
		family: 'gemini',
		provider: 'Google',
		goodAt: 'Fast, good for most study tasks',
	},
	{
		id: 'gemini-pro',
		label: 'Gemini Pro',
		family: 'gemini',
		provider: 'Google',
		goodAt: 'Slower, better at hard topics',
	},
	{
		id: 'claude-haiku',
		label: 'Claude Haiku',
		family: 'claude',
		provider: 'Anthropic',
		goodAt: 'Fast, short and clear answers',
	},
	{
		id: 'claude-sonnet',
		label: 'Claude Sonnet',
		family: 'claude',
		provider: 'Anthropic',
		goodAt: 'Clear, careful explanations',
	},
	{
		id: 'claude-opus',
		label: 'Claude Opus',
		family: 'claude',
		provider: 'Anthropic',
		goodAt: 'Slowest, best at deep reasoning',
	},
];

export const defaultModelId = 'gemini-flash';
