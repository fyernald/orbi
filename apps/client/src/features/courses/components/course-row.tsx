import type { Course } from '@orbi/shared';
import Link from 'next/link';
import { courseRoute } from '@/lib/routes';
import { courseStatus } from '../course-status';
import { CourseActions } from './course-actions';
import { ExamDays } from './exam-days';
import { MasteryRing } from './mastery-ring';

type CourseRowProps = {
	course: Course;
	now: Date;
};

// a course in the list; the name link covers the whole row, and the menu sits above it
// (with a mouse the menu shows on hover, on touch screens it always shows)
export function CourseRow({ course, now }: CourseRowProps) {
	return (
		<div className="group relative grid grid-cols-[2.75rem_minmax(0,1fr)_auto_2rem] items-center gap-4 rounded-xl px-3 py-3 transition-colors focus-within:bg-card hover:bg-card">
			{/* the mastery score comes with the review scheduler in Sprint 3 */}
			<MasteryRing value={null} color={course.color} />
			<div className="flex min-w-0 flex-col">
				<h3 className="truncate font-medium">
					<Link
						href={courseRoute(course.id)}
						className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
					>
						{course.name}
					</Link>
				</h3>
				<p className="truncate text-sm text-muted-foreground">
					{courseStatus(course, now)}
				</p>
			</div>
			<div>
				<ExamDays examDate={course.examDate} now={now} />
			</div>
			<div className="relative z-10 transition-opacity pointer-fine:opacity-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100 pointer-fine:has-data-[state=open]:opacity-100">
				<CourseActions course={course} variant="row" />
			</div>
		</div>
	);
}
