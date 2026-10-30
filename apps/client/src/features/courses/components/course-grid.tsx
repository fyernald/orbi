import type { Course } from '@orbi/shared';
import { CourseCard } from './course-card';

// up to this many cards show at once; past that the grid keeps three rows and scrolls
const VISIBLE_CARDS = 9;

type CourseGridProps = {
	courses: Course[];
	now: Date;
};

// every card is 13rem tall, so three rows with their two gaps fit in 41rem
// (the 0.25rem padding keeps hover shadows and focus rings from being cut off)
export function CourseGrid({ courses, now }: CourseGridProps) {
	const list = (
		<ul className="grid auto-rows-[13rem] gap-3 sm:grid-cols-2 xl:grid-cols-3">
			{courses.map((course) => (
				<li key={course.id}>
					<CourseCard course={course} now={now} />
				</li>
			))}
		</ul>
	);

	if (courses.length <= VISIBLE_CARDS) return list;

	return (
		<div
			role="region"
			aria-label="All courses"
			tabIndex={0}
			className="-m-1 max-h-[41rem] overflow-y-auto rounded-2xl p-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
		>
			{list}
		</div>
	);
}
