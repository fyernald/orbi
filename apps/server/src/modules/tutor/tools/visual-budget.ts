import { VISUALS_PER_REPLY_MAX } from '@orbi/shared';

export type VisualBudget = {
	// call once per visual shown; throws when the reply has no room left
	take: () => void;
};

// The visuals one reply may still show (T-72). The error goes back to the model,
// which then explains in text instead of drawing more.
export function createVisualBudget(max = VISUALS_PER_REPLY_MAX): VisualBudget {
	let shown = 0;
	return {
		take() {
			if (shown >= max) {
				throw new Error(
					`This reply already shows ${max} visuals. Do not make more, explain in text.`
				);
			}
			shown += 1;
		},
	};
}
