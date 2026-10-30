import type { Course } from '@orbi/shared';
import { cn } from '@/lib/utils';
import { CourseCard } from './course-card';

type CourseGridPageProps = {
	courses: Course[];
	now: Date;
	className?: string;
};

// one page of course cards: on wide screens 3 columns and 2 rows
export function CourseGridPage({
	courses,
	now,
	className,
}: CourseGridPageProps) {
	return (
		<ul
			className={cn(
				'grid auto-rows-[13rem] content-start gap-3 sm:grid-cols-2 xl:grid-cols-3',
				className
			)}
		>
			{courses.map((course) => (
				<li key={course.id}>
					<CourseCard course={course} now={now} />
				</li>
			))}
		</ul>
	);
}
