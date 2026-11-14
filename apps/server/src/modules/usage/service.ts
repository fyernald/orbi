import type { AiUsage } from '@orbi/shared';
import { creditWeightOf } from '../../ai/catalog';
import { UsageLimitError } from '../../errors';
import {
	HOUR_MS,
	resetsIn,
	USAGE_LIMITS_DEFAULT,
	WEEK_MS,
	windowUsage,
	worseState,
	type UsageLimits,
} from './limits';
import type { UsageRepository } from './repository';

export interface UsageService {
	getUsage(userId: string): Promise<AiUsage>;
	// throws before a model call when the student or the beta is over a limit
	requireRoom(userId: string): Promise<void>;
	// counts one finished model call
	spend(userId: string, modelId: string, tokens: number): Promise<void>;
}

const BUDGET_USED_UP =
	"Orbi's AI budget for the beta is used up. Thank you for testing! We will let you know when it is back.";

export function createUsageService({
	repo,
	limits = USAGE_LIMITS_DEFAULT,
	weightOf = creditWeightOf,
	now = () => new Date(),
}: {
	repo: UsageRepository;
	limits?: UsageLimits;
	// credits per token of a catalog model
	weightOf?: (modelId: string) => number;
	now?: () => Date;
}): UsageService {
	async function usageAt(userId: string, at: Date) {
		const saved = await repo.findUsage(userId);
		const grace = { gracePercent: limits.gracePercent };
		const hour = windowUsage(
			saved.hour,
			{ ...grace, limit: limits.hourCredits, lengthMs: HOUR_MS },
			at
		);
		const week = windowUsage(
			saved.week,
			{ ...grace, limit: limits.weekCredits, lengthMs: WEEK_MS },
			at
		);
		return { hour, week };
	}

	const budgetUsedUp = async () =>
		(await repo.totalCredits()) >= limits.totalCredits;

	return {
		async getUsage(userId) {
			const { hour, week } = await usageAt(userId, now());
			const { blocked: _, ...hourWindow } = hour;
			const { blocked: __, ...weekWindow } = week;
			return {
				hour: hourWindow,
				week: weekWindow,
				state: worseState(hour.state, week.state),
				budgetUsedUp: await budgetUsedUp(),
			};
		},

		async requireRoom(userId) {
			const at = now();
			const { hour, week } = await usageAt(userId, at);
			// with both used up, the week decides when the student can go on
			if (week.blocked) {
				throw new UsageLimitError(
					`You have used this week's AI limit. It resets ${resetsIn(new Date(week.resetsAt!), at)}.`
				);
			}
			if (hour.blocked) {
				throw new UsageLimitError(
					`You have used this hour's AI limit. It resets ${resetsIn(new Date(hour.resetsAt!), at)}.`
				);
			}
			if (await budgetUsedUp()) throw new UsageLimitError(BUDGET_USED_UP);
		},

		async spend(userId, modelId, tokens) {
			if (tokens <= 0) return;
			await repo.addCredits(
				userId,
				Math.ceil(tokens * weightOf(modelId)),
				now()
			);
		},
	};
}
