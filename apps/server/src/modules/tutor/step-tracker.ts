import type { LanguageModelUsage } from 'ai';
import { usageLine, type LogUsage, type UsageAction } from '../../ai/usage';
import type { UsageService } from '../usage/service';

export type TrackStep = ReturnType<typeof createStepTracker>;

export function createStepTracker({
	logUsage,
	usage,
	logError,
}: {
	logUsage: LogUsage;
	usage: Pick<UsageService, 'spend'>;
	logError: (error: unknown) => void;
}) {
	// one log line after every model call, with its token counts, which are also
	// counted against the student's AI usage limits
	const trackStep =
		({
			userId,
			modelId,
			action,
		}: {
			userId: string;
			modelId: string;
			action: UsageAction;
		}) =>
		async (step: { stepNumber: number; usage: LanguageModelUsage }) => {
			logUsage(
				usageLine({ modelId, action, step: step.stepNumber, usage: step.usage })
			);
			// a failed count must not break the reply the student is reading
			await usage
				.spend(
					userId,
					modelId,
					(step.usage.inputTokens ?? 0) + (step.usage.outputTokens ?? 0)
				)
				.catch(logError);
		};
	return trackStep;
}
