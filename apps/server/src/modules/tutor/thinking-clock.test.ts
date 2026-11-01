import { describe, expect, it } from 'vitest';
import { createThinkingClock, thinkingTimesOf } from './thinking-clock';

// a clock whose time the test moves by hand
function fakeNow() {
	let ms = 0;
	return {
		now: () => new Date(ms),
		advance: (by: number) => {
			ms += by;
		},
	};
}

describe('createThinkingClock', () => {
	it('times each thinking part in order', () => {
		const time = fakeNow();
		const clock = createThinkingClock(time.now);

		clock.track({ type: 'reasoning-start', id: 'a' });
		time.advance(1200);
		clock.track({ type: 'reasoning-end', id: 'a' });
		clock.track({ type: 'text-start', id: 't' });
		time.advance(500);
		clock.track({ type: 'reasoning-start', id: 'b' });
		time.advance(300);
		clock.track({ type: 'reasoning-end', id: 'b' });

		expect(clock.times()).toEqual([1200, 300]);
	});

	it('has no times for a reply that did not think', () => {
		const clock = createThinkingClock(fakeNow().now);
		clock.track({ type: 'text-start', id: 't' });

		expect(clock.times()).toBeUndefined();
	});

	it('counts an unfinished thinking part as 0', () => {
		const clock = createThinkingClock(fakeNow().now);
		clock.track({ type: 'reasoning-start', id: 'a' });

		expect(clock.times()).toEqual([0]);
	});

	it('goes on after the times a continued reply already has', () => {
		const time = fakeNow();
		const clock = createThinkingClock(time.now, [900]);

		clock.track({ type: 'reasoning-start', id: 'b' });
		time.advance(400);
		clock.track({ type: 'reasoning-end', id: 'b' });

		expect(clock.times()).toEqual([900, 400]);
	});
});

describe('thinkingTimesOf', () => {
	it('gives one time per thinking part, 0 where none was saved', () => {
		const parts = [
			{ type: 'reasoning' },
			{ type: 'tool-askStudent' },
			{ type: 'reasoning' },
			{ type: 'text' },
		];

		expect(thinkingTimesOf({ parts, metadata: { thinkingMs: [700] } })).toEqual(
			[700, 0]
		);
		expect(thinkingTimesOf({ parts })).toEqual([0, 0]);
	});
});
