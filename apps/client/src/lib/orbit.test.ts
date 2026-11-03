import { describe, expect, it } from 'vitest';
import { orbitPoint } from './orbit';

describe('orbitPoint', () => {
	it.each([
		[0, 22, 3],
		[25, 41, 22],
		[50, 22, 41],
		[75, 3, 22],
	])('puts %s%% at (%s, %s)', (percent, x, y) => {
		const point = orbitPoint(percent, 19, 22);
		expect(point.x).toBeCloseTo(x);
		expect(point.y).toBeCloseTo(y);
	});
});
