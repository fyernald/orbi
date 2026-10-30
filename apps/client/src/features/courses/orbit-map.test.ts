import type { Course } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import { orbitMoons, ringRadii } from './orbit-map';

const course = (name: string, examDate: string | null = null): Course => ({
	id: name,
	name,
	description: null,
	color: 'blue',
	goal: 'keep_up',
	examDate,
	topicCount: 0,
	noteCount: 0,
	lastActivityAt: '2026-10-01T10:00:00.000Z',
});

const now = new Date(2026, 9, 30, 12, 0);
const distance = ({ x, y }: { x: number; y: number }) =>
	Math.hypot(x - 50, y - 50);

describe('orbitMoons', () => {
	it('puts a sooner exam on an inner ring', () => {
		const moons = orbitMoons(
			[
				course('None'),
				course('Later', '2026-12-01'),
				course('Soon', '2026-11-05'),
			],
			now
		);
		expect(moons.map(({ course, ring }) => [course.name, ring])).toEqual([
			['Soon', 0],
			['Later', 1],
			['None', 2],
		]);
		moons.forEach((moon) =>
			expect(distance(moon)).toBeCloseTo(ringRadii[moon.ring]!)
		);
	});

	it('spreads the moons of one ring evenly', () => {
		const [first, second] = orbitMoons([course('A'), course('B')], now);
		// two moons on a ring sit on opposite sides of the center
		expect(first!.x + second!.x).toBeCloseTo(100);
		expect(first!.y + second!.y).toBeCloseTo(100);
	});
});
