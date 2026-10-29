import { CalendarClock } from 'lucide-react';
import { formatLongDate } from '@/lib/dates';
import { daysUntil } from '../exam-date';

function countdown(days: number): { big: string; small: string } {
	if (days > 1) return { big: String(days), small: 'days to go' };
	if (days === 1) return { big: '1', small: 'day to go' };
	if (days === 0) return { big: 'Today', small: 'Good luck!' };
	return { big: 'Done', small: 'The exam is over' };
}

export function ExamCountdown({ examDate }: { examDate: string | null }) {
	const { big, small } = examDate
		? countdown(daysUntil(examDate, new Date()))
		: { big: '', small: '' };

	return (
		<div className="flex flex-col gap-2">
			<h3 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
				<CalendarClock className="size-3.5" />
				Exam
			</h3>
			{examDate ? (
				<>
					<p className="flex items-baseline gap-1.5">
						<span className="text-3xl font-semibold tracking-tight tabular-nums">
							{big}
						</span>
						<span className="text-sm text-muted-foreground">{small}</span>
					</p>
					<p className="text-sm text-muted-foreground">
						{formatLongDate(examDate)}
					</p>
				</>
			) : (
				<p className="text-sm text-muted-foreground">No exam date set.</p>
			)}
		</div>
	);
}
