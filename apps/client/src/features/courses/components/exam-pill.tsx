import { CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { daysUntil } from '../exam-date';

// a week or less before the exam, the pill turns to the warning colour
const SOON_DAYS = 7;

function label(days: number): string {
	if (days > 1) return `Exam in ${days} days`;
	if (days === 1) return 'Exam tomorrow';
	if (days === 0) return 'Exam today';
	return 'Exam done';
}

type ExamPillProps = {
	examDate: string;
	now: Date;
	className?: string;
};

export function ExamPill({ examDate, now, className }: ExamPillProps) {
	const days = daysUntil(examDate, now);
	const soon = days >= 0 && days <= SOON_DAYS;

	return (
		<span
			className={cn(
				'inline-flex h-6 items-center gap-1 rounded-md px-2 text-xs font-medium',
				soon
					? 'bg-warning text-white'
					: 'bg-card/80 text-foreground backdrop-blur-sm',
				className
			)}
		>
			<CalendarClock className="size-3.5" />
			{label(days)}
		</span>
	);
}
