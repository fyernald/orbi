import { CalendarClock } from 'lucide-react';
import { formatLongDate } from '@/lib/dates';
import { daysUntil } from '../exam-date';

function countdown(days: number): { big: string; small: string } {
	if (days > 1) return { big: String(days), small: 'days to go' };
	if (days === 1) return { big: '1', small: 'day to go' };
	if (days === 0) return { big: 'Today', small: 'Good luck!' };
	return { big: 'Done', small: 'The exam is over' };
}

export function ExamCard({ examDate }: { examDate: string }) {
	const { big, small } = countdown(daysUntil(examDate, new Date()));

	return (
		<section className="rounded-3xl border border-border bg-card p-5 shadow-xs">
			<h2 className="flex items-center gap-1.5 text-sm text-muted-foreground">
				<CalendarClock className="size-4" />
				Exam
			</h2>
			<p className="mt-3 flex items-baseline gap-2">
				<span className="text-4xl font-semibold tracking-tight tabular-nums">
					{big}
				</span>
				<span className="text-sm text-muted-foreground">{small}</span>
			</p>
			<p className="mt-1 text-sm">{formatLongDate(examDate)}</p>
		</section>
	);
}
