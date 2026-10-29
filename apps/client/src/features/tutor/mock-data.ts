// mock data until the model catalog and the tutor API are ready

// a topic as the composer shows it: the course name comes with it
export type Topic = {
	id: string;
	course: string;
	name: string;
};

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
