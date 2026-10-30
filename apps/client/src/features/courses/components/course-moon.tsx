import type { Course } from '@orbi/shared';
import Link from 'next/link';
import { courseRoute } from '@/lib/routes';
import { toneClasses } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { courseShortName } from '../badge';
import { examCountdown, upcomingExam } from '../exam-date';

type CourseMoonProps = {
	course: Course;
	now: Date;
	// the moon's center as a share of the map's width and height
	x: number;
	y: number;
};

export function CourseMoon({ course, now, x, y }: CourseMoonProps) {
	const examDate = upcomingExam(course, now);
	const label = `${course.name}: ${examDate ? examCountdown(examDate, now).toLowerCase() : 'no exam coming up'}`;

	return (
		<Link
			href={courseRoute(course.id)}
			aria-label={label}
			title={label}
			style={{ left: `${x}%`, top: `${y}%` }}
			className={cn(
				'absolute flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] font-semibold ring-3 ring-card transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:ring-ring focus-visible:outline-none',
				toneClasses[course.color]
			)}
		>
			{courseShortName(course.name) || '?'}
		</Link>
	);
}
