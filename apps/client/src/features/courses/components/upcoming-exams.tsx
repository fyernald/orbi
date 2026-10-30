import type { Course } from '@orbi/shared';
import Link from 'next/link';
import { formatShortDate } from '@/lib/dates';
import { courseRoute } from '@/lib/routes';
import { coursesWithExamAhead } from '../exam-date';
import { CourseBadge } from './course-badge';

// at most this many, so the panel stays as tall as two rows of course cards
const MAX_SHOWN = 7;

type UpcomingExamsProps = {
	courses: Course[];
	now: Date;
};

export function UpcomingExams({ courses, now }: UpcomingExamsProps) {
	const upcoming = coursesWithExamAhead(courses, now);
	const shown = upcoming.slice(0, MAX_SHOWN);
	const more = upcoming.length - shown.length;

	return (
		<section
			aria-labelledby="upcoming-exams-title"
			className="flex flex-col gap-1"
		>
			<h3
				id="upcoming-exams-title"
				className="text-[13px] font-medium text-muted-foreground"
			>
				Upcoming exams
			</h3>
			{upcoming.length === 0 ? (
				<p className="py-2 text-sm text-muted-foreground">
					No exams coming up.
				</p>
			) : (
				<ol className="flex flex-col">
					{shown.map((course) => (
						<li
							key={course.id}
							className="flex items-center gap-3 border-t border-divider py-2.5 first:border-t-0"
						>
							<CourseBadge course={course} />
							<Link
								href={courseRoute(course.id)}
								className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
							>
								{course.name}
							</Link>
							<span className="text-sm text-muted-foreground tabular-nums">
								{formatShortDate(course.examDate!)}
							</span>
						</li>
					))}
				</ol>
			)}
			{more > 0 && (
				<p className="border-t border-divider pt-2.5 text-sm text-muted-foreground">
					and {more} more
				</p>
			)}
		</section>
	);
}
