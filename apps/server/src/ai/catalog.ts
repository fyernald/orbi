import type { AiModel } from '@orbi/shared';

// The models a student can pick (app-patterns rule 6). Add or change rows here;
// the rest of the app reads them. The Gemini "latest" aliases follow Google's
// newest model, so they need no update when a new one comes out.
export type CatalogModel = AiModel & {
	// the name the provider's API knows
	providerModelId: string;
};

export const MODEL_CATALOG: CatalogModel[] = [
	{
		id: 'gemini-flash',
		label: 'Gemini Flash',
		provider: 'google',
		providerModelId: 'gemini-flash-latest',
		goodAt: 'Fast, good for most study tasks',
	},
	{
		id: 'gemini-flash-lite',
		label: 'Gemini Flash-Lite',
		provider: 'google',
		providerModelId: 'gemini-flash-lite-latest',
		goodAt: 'Fastest, good for quick questions',
	},
	{
		id: 'gemini-pro',
		label: 'Gemini Pro',
		provider: 'google',
		providerModelId: 'gemini-pro-latest',
		goodAt: 'Slower, better at hard topics',
	},
	{
		id: 'claude-haiku',
		label: 'Claude Haiku',
		provider: 'anthropic',
		providerModelId: 'claude-haiku-5-5',
		goodAt: 'Fast, short and clear answers',
	},
	{
		id: 'claude-sonnet',
		label: 'Claude Sonnet',
		provider: 'anthropic',
		providerModelId: 'claude-sonnet-5-5',
		goodAt: 'Clear, careful explanations',
	},
	{
		id: 'claude-opus',
		label: 'Claude Opus',
		provider: 'anthropic',
		providerModelId: 'claude-opus-5-5',
		goodAt: 'Slowest, best at deep reasoning',
	},
	{
		id: 'deepseek-flash',
		label: 'DeepSeek Flash',
		provider: 'deepseek',
		// follows DeepSeek's newest Flash model, like the Gemini aliases
		providerModelId: 'deepseek-flash',
		goodAt: 'Low cost, good for most study tasks',
	},
	{
		id: 'deepseek-pro',
		label: 'DeepSeek Pro',
		provider: 'deepseek',
		providerModelId: 'deepseek-v4-pro',
		goodAt: 'Low cost, better at hard topics',
	},
];

// the first available one is used when this one has no key
export const DEFAULT_MODEL_ID = 'gemini-flash';
