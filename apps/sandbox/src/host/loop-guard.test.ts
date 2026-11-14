import { describe, expect, it } from 'vitest';
import {
	createLoopGuard,
	guardLoops,
	LOOP_GUARD_NAME,
	LOOP_LIMIT_MS,
} from './loop-guard';

const GUARD = `${LOOP_GUARD_NAME}();`;

describe('guardLoops', () => {
	it('puts the guard first in every kind of loop', () => {
		expect(guardLoops('while (go) { step(); }')).toBe(
			`while (go) {${GUARD}{ step(); }}`
		);
		expect(guardLoops('for (let i = 0; i < 3; i++) x(i);')).toBe(
			`for (let i = 0; i < 3; i++) {${GUARD}x(i);}`
		);
		expect(guardLoops('do { tick(); } while (on);')).toBe(
			`do {${GUARD}{ tick(); }} while (on);`
		);
		expect(guardLoops('for (const bar of bars) draw(bar);')).toBe(
			`for (const bar of bars) {${GUARD}draw(bar);}`
		);
	});

	it('guards nested loops and loops inside functions', () => {
		const guarded = guardLoops(
			'function sort(a) { for (const i of a) while (i) i--; }'
		);

		expect(guarded).toBe(
			`function sort(a) { for (const i of a) {${GUARD}while (i) {${GUARD}i--;}} }`
		);
	});

	it('keeps labels working', () => {
		const guarded = guardLoops(
			'outer: for (;;) { for (;;) { continue outer; } }'
		);

		expect(() => new Function(LOOP_GUARD_NAME, guarded)).not.toThrow();
	});

	it('leaves code without loops, and code that does not parse, as it is', () => {
		expect(guardLoops('draw();')).toBe('draw();');
		expect(guardLoops('while (')).toBe('while (');
	});
});

describe('createLoopGuard', () => {
	it('stops an endless loop once it has run too long', () => {
		let clock = 0;
		const guard = createLoopGuard(() => (clock += 10));
		const run = new Function(LOOP_GUARD_NAME, guardLoops('while (true) {}'));

		expect(() => run(guard.check)).toThrow('so it was stopped');
		expect(clock).toBeGreaterThan(LOOP_LIMIT_MS);
	});

	it('lets a loop run while the page keeps breathing', () => {
		let clock = 0;
		const guard = createLoopGuard(() => clock);

		clock = LOOP_LIMIT_MS * 3;
		guard.breathe();

		expect(() => guard.check()).not.toThrow();
	});
});
