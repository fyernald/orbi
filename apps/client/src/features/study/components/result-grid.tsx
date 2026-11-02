import { cn } from '@/lib/utils';
import type { StudyRun } from '../session';

const resultLabel = (answer: StudyRun['answers'][number]) =>
	answer === null ? 'skipped' : answer.correct ? 'correct' : 'wrong';

// one numbered square per question, green when right and red when wrong
export function ResultGrid({ answers }: { answers: StudyRun['answers'] }) {
	return (
		<ol
			aria-label="Your answers"
			className="flex flex-wrap justify-center gap-1.5"
		>
			{answers.map((answer, index) => (
				<li
					key={index}
					className={cn(
						'flex size-8 items-center justify-center rounded-lg text-xs font-medium tabular-nums',
						answer === null && 'bg-muted text-muted-foreground',
						answer?.correct && 'bg-tone-green text-tone-green-foreground',
						answer?.correct === false && 'bg-tone-red text-tone-red-foreground'
					)}
				>
					{index + 1}
					<span className="sr-only">: {resultLabel(answer)}</span>
				</li>
			))}
		</ol>
	);
}
