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
	// the moon's center as a share of the orbit's width and height
	x: number;
	y: number;
};

// turns back against its ring and stands up against the tilt,
// so the moon always faces the viewer while it travels round
export function CourseMoon({ course, now, x, y }: CourseMoonProps) {
	const examDate = upcomingExam(course, now);
	const label = `${course.name}: ${examDate ? examCountdown(examDate, now).toLowerCase() : 'no exam coming up'}`;

	return (
		<span
			style={{ left: `${x}%`, top: `${y}%` }}
			className="absolute size-0 transform-3d animate-[orbit_var(--orbit-duration)_linear_infinite_reverse] group-focus-within/orbit:[animation-play-state:paused] group-hover/orbit:[animation-play-state:paused] motion-reduce:animate-none"
		>
			<Link
				href={courseRoute(course.id)}
				aria-label={label}
				title={label}
				className={cn(
					'absolute flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] font-semibold shadow-sm ring-3 ring-card transition-[scale] [transform:rotateX(calc(var(--orbit-tilt)*-1))] hover:scale-110 focus-visible:scale-110 focus-visible:ring-ring focus-visible:outline-none',
					toneClasses[course.color]
				)}
			>
				{courseShortName(course.name) || '?'}
			</Link>
		</span>
	);
}
