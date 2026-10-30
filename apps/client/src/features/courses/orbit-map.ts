import type { Course } from '@orbi/shared';
import { groupCourses, type CourseGroupId } from './course-groups';
import { orbitPoint } from './orbit';

// each group's ring, from the center out: exam soon, exam later, no exam
const ringOf: Record<CourseGroupId, number> = { soon: 0, later: 1, none: 2 };

// ring sizes as a share of the map's width, and where each ring's first moon sits
// (as a share of a turn), so moons on neighbouring rings do not line up
export const ringRadii = [17, 31, 45];
const ringStarts = [10, 45, 75];

export type OrbitMoon = {
	course: Course;
	ring: number;
	// the moon's center as a share of the map's width and height
	x: number;
	y: number;
};

// every course as a moon: the sooner its exam, the closer it orbits the center,
// and the moons of one ring are spread evenly around it
export function orbitMoons(courses: Course[], now: Date): OrbitMoon[] {
	return groupCourses(courses, now).flatMap((group) => {
		const ring = ringOf[group.id];
		return group.courses.map((course, index) => {
			const turn = ringStarts[ring]! + (index * 100) / group.courses.length;
			return { course, ring, ...orbitPoint(turn % 100, ringRadii[ring]!, 50) };
		});
	});
}
