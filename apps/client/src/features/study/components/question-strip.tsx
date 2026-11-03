import { cn } from '@/lib/utils';
import type { MapItem, QuestionResult } from '../question-map';

// full class names, so Tailwind finds them
const segmentTones: Record<QuestionResult, string> = {
	correct: 'bg-tone-green-foreground',
	wrong: 'bg-tone-red-foreground',
	skipped: 'bg-muted-foreground/40',
	waiting: 'bg-muted',
};

// the question map folded into one thin bar for phones: a segment per question
export function QuestionStrip({ items }: { items: MapItem[] }) {
	const done = items.filter(({ result }) => result !== 'waiting').length;

	return (
		<div
			role="progressbar"
			aria-label="Questions answered"
			aria-valuemin={0}
			aria-valuemax={items.length}
			aria-valuenow={done}
			className="flex h-1.5 gap-0.5"
		>
			{items.map(({ number, result, current }) => (
				<span
					key={number}
					className={cn(
						'min-w-0 flex-1 rounded-full transition-colors duration-300 motion-reduce:transition-none',
						current && result === 'waiting'
							? 'bg-primary'
							: segmentTones[result]
					)}
				/>
			))}
		</div>
	);
}
