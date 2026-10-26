import { cn } from '@/lib/utils';
import type { CourseSummary } from '../mock-data';
import { toneClasses } from '../tones';

export function CourseBadge({ course }: { course: CourseSummary }) {
	return (
		<span
			aria-hidden="true"
			className={cn(
				'flex h-6 min-w-8 items-center justify-center rounded-lg px-1 text-[11px] font-semibold',
				toneClasses[course.tone]
			)}
		>
			{course.shortName}
		</span>
	);
}
