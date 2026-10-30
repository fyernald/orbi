import type { Course } from '@orbi/shared';
import Link from 'next/link';
import { courseRoute } from '@/lib/routes';
import { courseStatus } from '../course-status';
import { CourseActions } from './course-actions';
import { CoursePill } from './course-pill';
import { MasteryRing } from './mastery-ring';

type CourseCardProps = {
	course: Course;
	now: Date;
};

// the name link covers the whole card, and the menu sits above it
// (with a mouse the menu shows on hover, on touch screens it always shows)
export function CourseCard({ course, now }: CourseCardProps) {
	return (
		<article className="group relative flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-shadow focus-within:shadow-md hover:shadow-md">
			<div className="flex items-start justify-between gap-2">
				{/* the mastery score comes with the review scheduler in Sprint 3 */}
				<MasteryRing value={null} color={course.color} />
				<div className="relative z-10 -mt-1 -mr-1 transition-opacity pointer-fine:opacity-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100 pointer-fine:has-data-[state=open]:opacity-100">
					<CourseActions course={course} variant="row" />
				</div>
			</div>
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<h3 className="truncate font-semibold">
					<Link
						href={courseRoute(course.id)}
						className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
					>
						{course.name}
					</Link>
				</h3>
				<p className="line-clamp-2 text-sm text-muted-foreground">
					{courseStatus(course, now)}
				</p>
			</div>
			<CoursePill course={course} now={now} />
		</article>
	);
}
