import { createAnthropic } from '@ai-sdk/anthropic';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createGoogle } from '@ai-sdk/google';
import type {
	LanguageModelV4,
	SharedV4ProviderOptions,
} from '@ai-sdk/provider';
import type { AiModel, AiModels, AiProvider } from '@orbi/shared';
import {
	wrapLanguageModel,
	type LanguageModel,
	type LanguageModelMiddleware,
} from 'ai';
import { DEFAULT_MODEL_IDS, MODEL_CATALOG, type CatalogModel } from './catalog';

// what one request asks of the model
export type ModelOptions = {
	// the student turned Think on
	thinking: boolean;
};

// turns a provider's model name into a model the AI SDK can call
export type ModelFactory = (
	providerModelId: string,
	options: ModelOptions
) => LanguageModel;

export type ResolvedModel = {
	model: LanguageModel;
	entry: AiModel;
};

// what a student hears when they ask for a model this server cannot call
export const MODEL_NOT_IN_LIST = 'Choose a model from the list.';

// the catalog models this server can call, and the AI SDK model behind each one
export interface ModelRegistry {
	// preferredId is the student's own default; it is used when this server can call it
	list(preferredId?: string | null): AiModels;
	has(modelId: string): boolean;
	resolve(modelId: string, options: ModelOptions): ResolvedModel | undefined;
}

export function createModelRegistry({
	providers,
	catalog = MODEL_CATALOG,
	defaultModelIds = DEFAULT_MODEL_IDS,
	enabledModelIds,
}: {
	providers: Partial<Record<AiProvider, ModelFactory>>;
	catalog?: CatalogModel[];
	defaultModelIds?: string[];
	// AI_ENABLED_MODELS: only these are offered, even when other keys are set
	enabledModelIds?: string[];
}): ModelRegistry {
	const available = catalog.filter(
		(entry) =>
			providers[entry.provider] &&
			(!enabledModelIds || enabledModelIds.includes(entry.id))
	);
	const toPublic = ({
		providerModelId: _,
		creditWeight: __,
		...entry
	}: CatalogModel): AiModel => entry;
	const fallbackId =
		defaultModelIds.find((id) => available.some((entry) => entry.id === id)) ??
		available[0]?.id ??
		null;

	const has = (modelId: string) =>
		available.some((entry) => entry.id === modelId);

	return {
		list: (preferredId) => ({
			models: available.map(toPublic),
			defaultModelId:
				preferredId && has(preferredId) ? preferredId : fallbackId,
		}),

		has,

		resolve(modelId, options) {
			const entry = available.find((item) => item.id === modelId);
			if (!entry) return undefined;
			const factory = providers[entry.provider]!;
			return {
				model: factory(entry.providerModelId, options),
				entry: toPublic(entry),
			};
		},
	};
}

// Turns on the model's thinking and asks for it back, so the student can read it.
// Some providers refuse a forced tool call while thinking ("Generate questions"),
// so that one step can use other settings.
export function thinkingMiddleware({
	thinking,
	forcedTool = thinking,
}: {
	thinking: SharedV4ProviderOptions;
	forcedTool?: SharedV4ProviderOptions;
}): LanguageModelMiddleware {
	return {
		transformParams: async ({ params }) => ({
			...params,
			providerOptions: {
				...params.providerOptions,
				...(params.toolChoice?.type === 'tool' ? forcedTool : thinking),
			},
		}),
	};
}

// With Think off the AI SDK turns thinking off for Claude and DeepSeek, and sets
// Gemini, which cannot stop thinking, to its lowest level. Thinking is billed as output.
export const NO_THINKING: LanguageModelMiddleware = {
	transformParams: async ({ params }) => ({ ...params, reasoning: 'none' }),
};

// each provider's settings for thinking that the student can read
export const PROVIDER_THINKING = {
	google: thinkingMiddleware({
		thinking: { google: { thinkingConfig: { includeThoughts: true } } },
	}),
	anthropic: thinkingMiddleware({
		thinking: {
			anthropic: { thinking: { type: 'adaptive', display: 'summarized' } },
		},
		forcedTool: { anthropic: { thinking: { type: 'disabled' } } },
	}),
	deepseek: thinkingMiddleware({
		thinking: { deepseek: { thinking: { type: 'enabled' } } },
		forcedTool: { deepseek: { thinking: { type: 'disabled' } } },
	}),
} satisfies Record<AiProvider, LanguageModelMiddleware>;

export const thinkingFor = (
	provider: AiProvider,
	{ thinking }: ModelOptions
) => (thinking ? PROVIDER_THINKING[provider] : NO_THINKING);

// a provider is only offered when its key is set
export function createProviderFactories(keys: {
	google?: string;
	anthropic?: string;
	deepseek?: string;
}): Partial<Record<AiProvider, ModelFactory>> {
	const factories: Partial<Record<AiProvider, ModelFactory>> = {};
	const withThinking =
		(provider: AiProvider, create: (id: string) => LanguageModelV4) =>
		(id: string, options: ModelOptions) =>
			wrapLanguageModel({
				model: create(id),
				middleware: thinkingFor(provider, options),
			});
	if (keys.google) {
		factories.google = withThinking(
			'google',
			createGoogle({ apiKey: keys.google })
		);
	}
	if (keys.anthropic) {
		factories.anthropic = withThinking(
			'anthropic',
			createAnthropic({ apiKey: keys.anthropic })
		);
	}
	if (keys.deepseek) {
		factories.deepseek = withThinking(
			'deepseek',
			createDeepSeek({ apiKey: keys.deepseek })
		);
	}
	return factories;
}
