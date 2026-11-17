import type { AiModel } from '@orbi/shared';

// The models a student can pick (app-patterns rule 6). Add or change rows here;
// the rest of the app reads them. The Gemini "latest" aliases follow Google's
// newest model, so they need no update when a new one comes out.
export type CatalogModel = AiModel & {
	// the name the provider's API knows
	providerModelId: string;
	// credits per token, about what the model costs next to DeepSeek Flash (T-77)
	creditWeight: number;
};

// Of the providers Orbi uses, only Gemini takes audio in its API; Claude takes
// images and PDFs, DeepSeek text, images and files (checked in November 2026)

export const MODEL_CATALOG: CatalogModel[] = [
	{
		id: 'gemini-flash',
		label: 'Gemini Flash',
		provider: 'google',
		providerModelId: 'gemini-flash-latest',
		goodAt: 'Fast, good for most study tasks',
		audio: true,
		creditWeight: 4,
	},
	{
		id: 'gemini-flash-lite',
		label: 'Gemini Flash-Lite',
		provider: 'google',
		providerModelId: 'gemini-flash-lite-latest',
		goodAt: 'Fastest, good for quick questions',
		audio: true,
		creditWeight: 1,
	},
	{
		id: 'gemini-pro',
		label: 'Gemini Pro',
		provider: 'google',
		providerModelId: 'gemini-pro-latest',
		goodAt: 'Slower, better at hard topics',
		audio: true,
		creditWeight: 16,
	},
	{
		id: 'claude-haiku',
		label: 'Claude Haiku',
		provider: 'anthropic',
		providerModelId: 'claude-haiku-5-5',
		goodAt: 'Fast, short and clear answers',
		audio: false,
		creditWeight: 1,
	},
	{
		id: 'claude-sonnet',
		label: 'Claude Sonnet',
		provider: 'anthropic',
		providerModelId: 'claude-sonnet-5-5',
		goodAt: 'Clear, careful explanations',
		audio: false,
		creditWeight: 20,
	},
	{
		id: 'claude-opus',
		label: 'Claude Opus',
		provider: 'anthropic',
		providerModelId: 'claude-opus-5-5',
		goodAt: 'Slowest, best at deep reasoning',
		audio: false,
		creditWeight: 40,
	},
	{
		id: 'deepseek-flash',
		label: 'DeepSeek Flash',
		provider: 'deepseek',
		// follows DeepSeek's newest Flash model, like the Gemini aliases
		providerModelId: 'deepseek-flash',
		goodAt: 'Low cost, good for most study tasks',
		audio: false,
		creditWeight: 1,
	},
	{
		id: 'deepseek-pro',
		label: 'DeepSeek Pro',
		provider: 'deepseek',
		providerModelId: 'deepseek-v4-pro',
		goodAt: 'Low cost, better at hard topics',
		audio: false,
		creditWeight: 4,
	},
];

// the first of these with a key is the default, so it stays a cheap model;
// with none of them, the first available model is used
export const DEFAULT_MODEL_IDS = ['gemini-flash', 'deepseek-flash'];

// a model that is not in the catalog any more counts like the dearest one
export const creditWeightOf = (modelId: string): number =>
	MODEL_CATALOG.find((entry) => entry.id === modelId)?.creditWeight ??
	Math.max(...MODEL_CATALOG.map((entry) => entry.creditWeight));
