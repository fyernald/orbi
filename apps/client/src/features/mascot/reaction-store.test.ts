import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createReactionStore } from './reaction-store';
import { poseFor } from './reactions';

describe('poseFor', () => {
	it('rests when nothing happens', () => {
		expect(poseFor([])).toBe('idle');
	});

	it('picks the reaction that matters most', () => {
		expect(poseFor(['sleepy', 'think'])).toBe('think');
		expect(poseFor(['think', 'cheer', 'wave'])).toBe('cheer');
		expect(poseFor(['sleepy', 'wave'])).toBe('wave');
	});
});

describe('the reaction store', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it('thinks while a reply is written and rests after', () => {
		const store = createReactionStore();

		const release = store.hold('think');
		expect(store.getPose()).toBe('think');

		release();
		expect(store.getPose()).toBe('idle');
	});

	it('keeps thinking until every place that asked lets go', () => {
		const store = createReactionStore();

		const first = store.hold('think');
		const second = store.hold('think');
		first();
		first();

		expect(store.getPose()).toBe('think');
		second();
		expect(store.getPose()).toBe('idle');
	});

	it('cheers for a moment over a sleepy page, then goes back', () => {
		const store = createReactionStore();
		store.hold('sleepy');

		store.flash('cheer', 2000);
		expect(store.getPose()).toBe('cheer');

		vi.advanceTimersByTime(2000);
		expect(store.getPose()).toBe('sleepy');
	});

	it('tells the cat only when its pose changes', () => {
		const store = createReactionStore();
		const listener = vi.fn();
		store.subscribe(listener);

		store.hold('think');
		store.hold('sleepy');

		expect(listener).toHaveBeenCalledOnce();
	});
});
