import { createAnthropic } from '@ai-sdk/anthropic';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createGoogle } from '@ai-sdk/google';
import type { SharedV4ProviderOptions } from '@ai-sdk/provider';
import type { AiModel, AiModels, AiProvider } from '@orbi/shared';
import {
	wrapLanguageModel,
	type LanguageModel,
	type LanguageModelMiddleware,
} from 'ai';
import { DEFAULT_MODEL_ID, MODEL_CATALOG, type CatalogModel } from './catalog';

// turns a provider's model name into a model the AI SDK can call
export type ModelFactory = (providerModelId: string) => LanguageModel;

export type ResolvedModel = {
	model: LanguageModel;
	entry: AiModel;
};

// the catalog models this server can call, and the AI SDK model behind each one
export interface ModelRegistry {
	list(): AiModels;
	resolve(modelId: string): ResolvedModel | undefined;
}

export function createModelRegistry({
	providers,
	catalog = MODEL_CATALOG,
	defaultModelId = DEFAULT_MODEL_ID,
}: {
	providers: Partial<Record<AiProvider, ModelFactory>>;
	catalog?: CatalogModel[];
	defaultModelId?: string;
}): ModelRegistry {
	const available = catalog.filter((entry) => providers[entry.provider]);
	const toPublic = ({ providerModelId: _, ...entry }: CatalogModel): AiModel =>
		entry;
	const fallbackId =
		available.find((entry) => entry.id === defaultModelId)?.id ??
		available[0]?.id ??
		null;

	return {
		list: () => ({
			models: available.map(toPublic),
			defaultModelId: fallbackId,
		}),

		resolve(modelId) {
			const entry = available.find((item) => item.id === modelId);
			if (!entry) return undefined;
			const factory = providers[entry.provider]!;
			return { model: factory(entry.providerModelId), entry: toPublic(entry) };
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

// a provider is only offered when its key is set
export function createProviderFactories(keys: {
	google?: string;
	anthropic?: string;
	deepseek?: string;
}): Partial<Record<AiProvider, ModelFactory>> {
	const factories: Partial<Record<AiProvider, ModelFactory>> = {};
	if (keys.google) {
		const google = createGoogle({ apiKey: keys.google });
		factories.google = (id) =>
			wrapLanguageModel({
				model: google(id),
				middleware: PROVIDER_THINKING.google,
			});
	}
	if (keys.anthropic) {
		const anthropic = createAnthropic({ apiKey: keys.anthropic });
		factories.anthropic = (id) =>
			wrapLanguageModel({
				model: anthropic(id),
				middleware: PROVIDER_THINKING.anthropic,
			});
	}
	if (keys.deepseek) {
		const deepseek = createDeepSeek({ apiKey: keys.deepseek });
		factories.deepseek = (id) =>
			wrapLanguageModel({
				model: deepseek(id),
				middleware: PROVIDER_THINKING.deepseek,
			});
	}
	return factories;
}
