import type { AiUsage, UsageState, UsageWindow } from '@orbi/shared';

export type WindowName = 'hour' | 'week';

const windowNames: Record<WindowName, string> = {
	hour: 'this hour',
	week: 'this week',
};

const stateOrder: readonly UsageState[] = [
	'ok',
	'warning',
	'almost',
	'grace',
	'blocked',
];

// A window that ended on this clock counts as empty, so the app opens again at
// the reset without waiting for the server
export function liveWindow(window: UsageWindow, now: Date): UsageWindow {
	if (window.resetsAt && new Date(window.resetsAt) <= now) {
		return { percent: 0, state: 'ok', resetsAt: null };
	}
	return window;
}

// the window closer to its limit; with both equal the week, since it lasts longer
export function worseWindow(
	usage: AiUsage,
	now: Date
): { name: WindowName; window: UsageWindow } {
	const hour = liveWindow(usage.hour, now);
	const week = liveWindow(usage.week, now);
	return stateOrder.indexOf(hour.state) > stateOrder.indexOf(week.state)
		? { name: 'hour', window: hour }
		: { name: 'week', window: week };
}

// "in 23 minutes", "in 5 hours", "in 3 days"
export function resetsIn(resetsAt: string, now: Date): string {
	const minutes = Math.max(
		1,
		Math.ceil((new Date(resetsAt).getTime() - now.getTime()) / 60_000)
	);
	if (minutes < 60) return plural(minutes, 'minute');
	const hours = Math.ceil(minutes / 60);
	if (hours < 48) return plural(hours, 'hour');
	return plural(Math.ceil(hours / 24), 'day');
}

const plural = (count: number, unit: string) =>
	`in ${count} ${unit}${count === 1 ? '' : 's'}`;

// "14:35" for the hour, "Mon 09:10" for the week, in the student's own clock
export function resetLabel(
	resetsAt: string,
	name: WindowName,
	locale?: string
): string {
	const options: Intl.DateTimeFormatOptions =
		name === 'hour'
			? { hour: '2-digit', minute: '2-digit' }
			: { weekday: 'short', hour: '2-digit', minute: '2-digit' };
	return new Intl.DateTimeFormat(locale, options).format(new Date(resetsAt));
}

// why no AI request can be sent now, or null; the server refuses the same way
export function usageBlockReason(usage: AiUsage, now: Date): string | null {
	if (usage.budgetUsedUp) {
		return "Orbi's AI budget for the beta is used up. Thank you for testing!";
	}
	// with both used up, the week decides when the student can go on
	for (const name of ['week', 'hour'] as const) {
		const window = liveWindow(usage[name], now);
		if (window.state === 'blocked' && window.resetsAt) {
			return `You have used ${windowNames[name]}'s AI limit. It resets ${resetsIn(window.resetsAt, now)}.`;
		}
	}
	return null;
}

export type UsageNotice = {
	level: 'warning' | 'almost' | 'grace';
	text: string;
};

// the "wrapping up" notice by the message box, or null while there is room
export function usageNotice(usage: AiUsage, now: Date): UsageNotice | null {
	const { name, window } = worseWindow(usage, now);
	const period = windowNames[name];
	const resets = window.resetsAt
		? ` It resets ${resetsIn(window.resetsAt, now)}.`
		: '';
	switch (window.state) {
		case 'warning':
			return {
				level: 'warning',
				text: `You have used ${window.percent}% of ${period}'s AI.${resets}`,
			};
		case 'almost':
			return {
				level: 'almost',
				text: `Almost at ${period}'s AI limit. Finish what you are working on.${resets}`,
			};
		case 'grace':
			return {
				level: 'grace',
				text: `You are over ${period}'s AI limit. You can finish this thought.${resets}`,
			};
		default:
			return null;
	}
}
