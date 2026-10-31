import type {
	LanguageModelV4CallOptions,
	LanguageModelV4StreamPart,
} from '@ai-sdk/provider';
import { simulateReadableStream } from 'ai';
import { MockLanguageModelV4 } from 'ai/test';
import { createModelRegistry } from './models';

const usage = {
	inputTokens: {
		total: 10,
		noCache: 10,
		cacheRead: undefined,
		cacheWrite: undefined,
	},
	outputTokens: { total: 5, text: 5, reasoning: undefined },
};

export type ScriptedStep =
	// delayMs holds the reply back, to test replies that run at the same time
	| { text: string; delayMs?: number }
	| { tool: string; input: unknown }
	| { error: unknown };

function streamFor(step: ScriptedStep, call: number) {
	if ('error' in step) throw step.error;
	const chunks: LanguageModelV4StreamPart[] =
		'text' in step
			? [
					{ type: 'text-start', id: 'text-1' },
					{ type: 'text-delta', id: 'text-1', delta: step.text },
					{ type: 'text-end', id: 'text-1' },
					{
						type: 'finish',
						finishReason: { unified: 'stop', raw: undefined },
						usage,
					},
				]
			: [
					{
						type: 'tool-call',
						toolCallId: `call-${call}`,
						toolName: step.tool,
						input: JSON.stringify(step.input),
					},
					{
						type: 'finish',
						finishReason: { unified: 'tool-calls', raw: undefined },
						usage,
					},
				];
	return {
		stream: simulateReadableStream({
			chunks,
			chunkDelayInMs: null,
			initialDelayInMs: 'delayMs' in step ? (step.delayMs ?? null) : null,
		}),
	};
}

// A fake model for tests: each model call takes the next scripted step. `calls`
// keeps what the model was sent, so tests can check the prompt and the tool choice.
export function createScriptedModels() {
	const steps: ScriptedStep[] = [];
	const calls: LanguageModelV4CallOptions[] = [];
	const model = new MockLanguageModelV4({
		doStream: async (options) => {
			calls.push(options);
			const step = steps.shift();
			if (!step) throw new Error('The test did not script this model call.');
			return streamFor(step, calls.length);
		},
	});

	return {
		registry: createModelRegistry({ providers: { google: () => model } }),
		script: (...next: ScriptedStep[]) => {
			steps.length = 0;
			calls.length = 0;
			steps.push(...next);
		},
		calls,
	};
}
