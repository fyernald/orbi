import type { Course } from '@orbi/shared';
import { toneClasses } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { courseShortName } from '../badge';

type CourseBadgeProps = {
	course: Pick<Course, 'name' | 'color'>;
	className?: string;
};

export function CourseBadge({ course, className }: CourseBadgeProps) {
	return (
		<span
			aria-hidden="true"
			className={cn(
				'flex h-6 min-w-8 items-center justify-center rounded-lg px-1 text-[11px] font-semibold',
				toneClasses[course.color],
				className
			)}
		>
			{courseShortName(course.name) || '?'}
		</span>
	);
}
