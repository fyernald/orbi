import { MockLanguageModelV4 } from 'ai/test';
import { describe, expect, it } from 'vitest';
import type { LanguageModelV4ToolChoice } from '@ai-sdk/provider';
import type { AiProvider } from '@orbi/shared';
import {
	createModelRegistry,
	createProviderFactories,
	PROVIDER_THINKING,
} from './models';

const mockFactory = () => new MockLanguageModelV4();

describe('createModelRegistry', () => {
	it('lists only the models of providers with a key', () => {
		const registry = createModelRegistry({
			providers: { anthropic: mockFactory },
		});

		const { models, defaultModelId } = registry.list();

		expect(models.map((model) => model.provider)).not.toContain('google');
		expect(models.length).toBeGreaterThan(0);
		// the catalog default is a Gemini model, so the first Claude one takes over
		expect(defaultModelId).toBe(models[0]!.id);
	});

	it('never sends the provider model name to the client', () => {
		const registry = createModelRegistry({
			providers: { google: mockFactory },
		});

		expect(registry.list().models[0]).not.toHaveProperty('providerModelId');
	});

	it('resolves only models it lists', () => {
		const registry = createModelRegistry({
			providers: { google: mockFactory },
		});

		expect(registry.resolve('gemini-flash')?.entry.provider).toBe('google');
		expect(registry.resolve('claude-sonnet')).toBeUndefined();
		expect(registry.resolve('made-up')).toBeUndefined();
	});

	it('has no default when no provider is set up', () => {
		const registry = createModelRegistry({ providers: {} });

		expect(registry.list()).toEqual({ models: [], defaultModelId: null });
	});
});

describe('createProviderFactories', () => {
	it('sets up only the providers with a key', () => {
		expect(Object.keys(createProviderFactories({ google: 'key' }))).toEqual([
			'google',
		]);
		expect(Object.keys(createProviderFactories({ deepseek: 'key' }))).toEqual([
			'deepseek',
		]);
		expect(createProviderFactories({})).toEqual({});
	});
});

describe('provider thinking', () => {
	const send = (provider: AiProvider, toolChoice?: LanguageModelV4ToolChoice) =>
		PROVIDER_THINKING[provider].transformParams!({
			type: 'stream',
			params: { prompt: [], toolChoice },
			model: new MockLanguageModelV4(),
		});
	const forced = { type: 'tool', toolName: 'createQuestions' } as const;

	it('asks every provider for its thinking', async () => {
		expect((await send('google')).providerOptions).toEqual({
			google: { thinkingConfig: { includeThoughts: true } },
		});
		expect((await send('anthropic', { type: 'auto' })).providerOptions).toEqual(
			{ anthropic: { thinking: { type: 'adaptive', display: 'summarized' } } }
		);
		expect((await send('deepseek')).providerOptions).toEqual({
			deepseek: { thinking: { type: 'enabled' } },
		});
	});

	it('turns thinking off for a forced tool where the provider refuses both', async () => {
		expect((await send('anthropic', forced)).providerOptions).toEqual({
			anthropic: { thinking: { type: 'disabled' } },
		});
		expect((await send('deepseek', forced)).providerOptions).toEqual({
			deepseek: { thinking: { type: 'disabled' } },
		});
		// Gemini already thinks while it calls a forced tool; it only sends the thoughts back
		expect((await send('google', forced)).providerOptions).toEqual({
			google: { thinkingConfig: { includeThoughts: true } },
		});
	});
});
