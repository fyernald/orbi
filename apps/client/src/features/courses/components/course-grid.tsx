import type { Course } from '@orbi/shared';
import { CourseCard } from './course-card';
import { NewCourseTile } from './new-course-tile';

type CourseGridProps = {
	courses: Course[];
	now: Date;
	// hidden while searching, so the results stay together
	showNewTile: boolean;
};

export function CourseGrid({ courses, now, showNewTile }: CourseGridProps) {
	return (
		<ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
			{courses.map((course) => (
				<li key={course.id}>
					<CourseCard course={course} now={now} />
				</li>
			))}
			{showNewTile && (
				<li>
					<NewCourseTile />
				</li>
			)}
		</ul>
	);
}
