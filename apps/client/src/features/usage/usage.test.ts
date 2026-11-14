import type { AiUsage, UsageWindow } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import {
	liveWindow,
	resetsIn,
	usageBlockReason,
	usageNotice,
	worseWindow,
} from './usage';

const now = new Date('2026-11-15T10:00:00Z');
const inMinutes = (minutes: number) =>
	new Date(now.getTime() + minutes * 60_000).toISOString();

const empty: UsageWindow = { percent: 0, state: 'ok', resetsAt: null };

const usage = (changes: Partial<AiUsage> = {}): AiUsage => ({
	hour: empty,
	week: empty,
	state: 'ok',
	budgetUsedUp: false,
	...changes,
});

describe('liveWindow', () => {
	it('counts a window that has ended as empty', () => {
		const blocked: UsageWindow = {
			percent: 112,
			state: 'blocked',
			resetsAt: inMinutes(-1),
		};

		expect(liveWindow(blocked, now)).toEqual(empty);
		expect(liveWindow({ ...blocked, resetsAt: inMinutes(5) }, now)).toEqual({
			...blocked,
			resetsAt: inMinutes(5),
		});
	});
});

describe('worseWindow', () => {
	it('picks the window closer to its limit', () => {
		const hour: UsageWindow = {
			percent: 92,
			state: 'almost',
			resetsAt: inMinutes(30),
		};
		const week: UsageWindow = {
			percent: 40,
			state: 'ok',
			resetsAt: inMinutes(3000),
		};

		expect(worseWindow(usage({ hour, week }), now).name).toBe('hour');
		expect(worseWindow(usage({ hour: week, week: hour }), now).name).toBe(
			'week'
		);
	});
});

describe('resetsIn', () => {
	it('says minutes, hours or days', () => {
		expect(resetsIn(inMinutes(1), now)).toBe('in 1 minute');
		expect(resetsIn(inMinutes(23), now)).toBe('in 23 minutes');
		expect(resetsIn(inMinutes(60), now)).toBe('in 1 hour');
		expect(resetsIn(inMinutes(3 * 24 * 60), now)).toBe('in 3 days');
	});
});

describe('usageNotice', () => {
	it('says nothing while there is room', () => {
		expect(usageNotice(usage(), now)).toBeNull();
	});

	it('warns at 75%, then more at 90%, then lets the student finish', () => {
		const at = (state: UsageWindow['state'], percent: number) =>
			usageNotice(
				usage({ hour: { percent, state, resetsAt: inMinutes(23) } }),
				now
			);

		expect(at('warning', 78)).toEqual({
			level: 'warning',
			text: "You have used 78% of this hour's AI. It resets in 23 minutes.",
		});
		expect(at('almost', 93)?.text).toBe(
			"Almost at this hour's AI limit. Finish what you are working on. It resets in 23 minutes."
		);
		expect(at('grace', 104)?.level).toBe('grace');
		// blocked is said by the message box itself
		expect(at('blocked', 115)).toBeNull();
	});
});

describe('usageBlockReason', () => {
	it('blocks until the window resets', () => {
		const blocked = usage({
			hour: { percent: 115, state: 'blocked', resetsAt: inMinutes(23) },
		});

		expect(usageBlockReason(blocked, now)).toBe(
			"You have used this hour's AI limit. It resets in 23 minutes."
		);
		expect(
			usageBlockReason(blocked, new Date(now.getTime() + 24 * 60_000))
		).toBeNull();
	});

	it('names the week when both are used up', () => {
		const both = usage({
			hour: { percent: 112, state: 'blocked', resetsAt: inMinutes(23) },
			week: { percent: 111, state: 'blocked', resetsAt: inMinutes(3000) },
		});

		expect(usageBlockReason(both, now)).toBe(
			"You have used this week's AI limit. It resets in 3 days."
		);
	});

	it('says so when the beta budget is used up', () => {
		expect(usageBlockReason(usage({ budgetUsedUp: true }), now)).toContain(
			'budget for the beta is used up'
		);
		expect(usageBlockReason(usage(), now)).toBeNull();
	});
});
