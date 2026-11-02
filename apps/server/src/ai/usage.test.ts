import { describe, expect, it } from 'vitest';
import { usageLine } from './usage';

describe('usageLine', () => {
	it('logs the token counts of a model call', () => {
		const line = usageLine({
			modelId: 'deepseek-flash',
			action: 'ask',
			step: 0,
			usage: {
				inputTokens: 1200,
				inputTokenDetails: {
					noCacheTokens: 200,
					cacheReadTokens: 1000,
					cacheWriteTokens: undefined,
				},
				outputTokens: 300,
				outputTokenDetails: { textTokens: 100, reasoningTokens: 200 },
				totalTokens: 1500,
			},
		});

		expect(line).toEqual({
			modelId: 'deepseek-flash',
			action: 'ask',
			step: 0,
			inputTokens: 1200,
			cachedInputTokens: 1000,
			outputTokens: 300,
			thinkingTokens: 200,
		});
	});

	it('counts what a provider does not report as 0', () => {
		const line = usageLine({
			modelId: 'gemini-flash',
			action: 'followUps',
			step: 1,
			usage: {
				inputTokens: undefined,
				inputTokenDetails: {
					noCacheTokens: undefined,
					cacheReadTokens: undefined,
					cacheWriteTokens: undefined,
				},
				outputTokens: undefined,
				outputTokenDetails: {
					textTokens: undefined,
					reasoningTokens: undefined,
				},
				totalTokens: undefined,
			},
		});

		expect(line).toMatchObject({
			inputTokens: 0,
			cachedInputTokens: 0,
			outputTokens: 0,
			thinkingTokens: 0,
		});
	});
});
