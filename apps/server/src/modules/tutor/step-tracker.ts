import type { LanguageModelUsage } from 'ai';
import type { TokenBudget } from '../../ai/budget';
import { usageLine, type LogUsage, type UsageAction } from '../../ai/usage';

export type TrackStep = ReturnType<typeof createStepTracker>;

export function createStepTracker({
	logUsage,
	budget,
}: {
	logUsage: LogUsage;
	budget: TokenBudget;
}) {
	// one log line after every model call, with its token counts, which also come off
	// the student's daily budget
	const trackStep =
		({
			userId,
			timeZone,
			modelId,
			action,
		}: {
			userId: string;
			timeZone: string | null;
			modelId: string;
			action: UsageAction;
		}) =>
		(step: { stepNumber: number; usage: LanguageModelUsage }) => {
			logUsage(
				usageLine({ modelId, action, step: step.stepNumber, usage: step.usage })
			);
			budget.spend(
				userId,
				timeZone,
				(step.usage.inputTokens ?? 0) + (step.usage.outputTokens ?? 0)
			);
		};
	return trackStep;
}
