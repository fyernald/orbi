import { describe, expect, it } from 'vitest';
import { HOUR_MS, resetsIn, windowUsage, worseState } from './limits';

const start = new Date('2026-11-15T10:00:00Z');
const at = (minutes: number) => new Date(start.getTime() + minutes * 60_000);
const hour = { limit: 1000, lengthMs: HOUR_MS, gracePercent: 10 };

describe('windowUsage', () => {
	it('is empty before the first AI use', () => {
		expect(windowUsage({ startedAt: null, credits: 0 }, hour, start)).toEqual({
			percent: 0,
			state: 'ok',
			resetsAt: null,
			blocked: false,
		});
	});

	it('warns at 75% and 90%, then gives the extra allowance', () => {
		const used = (credits: number) =>
			windowUsage({ startedAt: start, credits }, hour, at(10)).state;

		expect(used(740)).toBe('ok');
		expect(used(750)).toBe('warning');
		expect(used(900)).toBe('almost');
		expect(used(1000)).toBe('grace');
		expect(used(1099)).toBe('grace');
		expect(used(1100)).toBe('blocked');
	});

	it('resets when the window ends', () => {
		const saved = { startedAt: start, credits: 2000 };

		expect(windowUsage(saved, hour, at(59))).toMatchObject({
			percent: 200,
			blocked: true,
			resetsAt: '2026-11-15T11:00:00.000Z',
		});
		expect(windowUsage(saved, hour, at(60))).toEqual({
			percent: 0,
			state: 'ok',
			resetsAt: null,
			blocked: false,
		});
	});
});

describe('worseState', () => {
	it('keeps the state closer to the limit', () => {
		expect(worseState('ok', 'almost')).toBe('almost');
		expect(worseState('blocked', 'warning')).toBe('blocked');
	});
});

describe('resetsIn', () => {
	it('says minutes, hours, or days', () => {
		expect(resetsIn(at(1), start)).toBe('in 1 minute');
		expect(resetsIn(at(23), start)).toBe('in 23 minutes');
		expect(resetsIn(at(60), start)).toBe('in 1 hour');
		expect(resetsIn(at(5 * 60 - 10), start)).toBe('in 5 hours');
		expect(resetsIn(at(3 * 24 * 60), start)).toBe('in 3 days');
		// a moment past the end still says a minute, never "0"
		expect(resetsIn(start, at(1))).toBe('in 1 minute');
	});
});
