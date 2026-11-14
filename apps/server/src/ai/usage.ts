import type { TutorAction } from '@orbi/shared';
import type { LanguageModelUsage } from 'ai';

// what a model call is for: a tutor action, the follow-up questions, or explaining
// a wrong answer in a study session
export type UsageAction =
	TutorAction | 'followUps' | 'explainAnswer' | 'keyPoints';

// One log line per model call. Only names and counts, never the student's text (T-39).
export type UsageLine = {
	modelId: string;
	action: UsageAction;
	// a reply can take a few calls: a tool call, then the wrap-up
	step: number;
	inputTokens: number;
	cachedInputTokens: number;
	outputTokens: number;
	thinkingTokens: number;
};

export type LogUsage = (line: UsageLine) => void;

export function usageLine({
	modelId,
	action,
	step,
	usage,
}: {
	modelId: string;
	action: UsageAction;
	step: number;
	usage: LanguageModelUsage;
}): UsageLine {
	return {
		modelId,
		action,
		step,
		inputTokens: usage.inputTokens ?? 0,
		cachedInputTokens: usage.inputTokenDetails.cacheReadTokens ?? 0,
		outputTokens: usage.outputTokens ?? 0,
		thinkingTokens: usage.outputTokenDetails.reasoningTokens ?? 0,
	};
}
