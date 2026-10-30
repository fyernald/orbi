import type { Course } from '@orbi/shared';
import { CourseOrbitMap } from './course-orbit-map';
import { UpcomingExams } from './upcoming-exams';

type CoursesOrbitProps = {
	courses: Course[];
	now: Date;
};

// the side panel of the courses page: every course placed by how soon its exam is
export function CoursesOrbit({ courses, now }: CoursesOrbitProps) {
	return (
		<aside
			aria-labelledby="orbit-title"
			className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5"
		>
			<div className="flex flex-col gap-1">
				<h2 id="orbit-title" className="font-semibold">
					Your orbit
				</h2>
				<p className="text-sm text-muted-foreground">
					The closer a course is to the center, the sooner its exam.
				</p>
			</div>
			<CourseOrbitMap courses={courses} now={now} />
			<UpcomingExams courses={courses} now={now} />
		</aside>
	);
}
