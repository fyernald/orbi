import { formatShortDate } from '@/lib/dates';
import { examDaysLabel } from '../exam-date';

type ExamDaysProps = {
	examDate: string | null;
	now: Date;
};

// the time left before an exam and its date; nothing once it is over
export function ExamDays({ examDate, now }: ExamDaysProps) {
	const left = examDate && examDaysLabel(examDate, now);
	if (!examDate || !left) return null;

	return (
		<span className="flex flex-col items-end">
			<span className="font-semibold tabular-nums">
				<span className="sr-only">Exam: </span>
				{left}
			</span>
			<span className="text-xs text-muted-foreground">
				{formatShortDate(examDate)}
			</span>
		</span>
	);
}
