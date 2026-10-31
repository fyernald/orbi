import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogle } from '@ai-sdk/google';
import type { AiModel, AiModels, AiProvider } from '@orbi/shared';
import type { LanguageModel } from 'ai';
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

// a provider is only offered when its key is set
export function createProviderFactories(keys: {
	google?: string;
	anthropic?: string;
}): Partial<Record<AiProvider, ModelFactory>> {
	const factories: Partial<Record<AiProvider, ModelFactory>> = {};
	if (keys.google) {
		const google = createGoogle({ apiKey: keys.google });
		factories.google = (id) => google(id);
	}
	if (keys.anthropic) {
		const anthropic = createAnthropic({ apiKey: keys.anthropic });
		factories.anthropic = (id) => anthropic(id);
	}
	return factories;
}
