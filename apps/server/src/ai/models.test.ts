import { MockLanguageModelV4 } from 'ai/test';
import { describe, expect, it } from 'vitest';
import { createModelRegistry, createProviderFactories } from './models';

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
		expect(createProviderFactories({})).toEqual({});
	});
});
