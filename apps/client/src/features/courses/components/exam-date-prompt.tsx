import { Button } from '@/components/ui/button';
import { formatLongDate } from '@/lib/dates';

type ExamDatePromptProps = {
	// set when the course's exam is over
	pastExamDate: string | null;
	onAdd: () => void;
};

// a plan needs an exam ahead, so the card asks for one first
export function ExamDatePrompt({ pastExamDate, onAdd }: ExamDatePromptProps) {
	return (
		<div className="flex flex-col items-start gap-2">
			<p className="text-sm text-muted-foreground">
				{pastExamDate
					? `Your exam on ${formatLongDate(pastExamDate)} is over. Add the next one to plan again.`
					: 'Add your exam date and Orbi splits your topics over the days left.'}
			</p>
			<Button variant="outline" size="sm" onClick={onAdd}>
				{pastExamDate ? 'Set a new date' : 'Add exam date'}
			</Button>
		</div>
	);
}
