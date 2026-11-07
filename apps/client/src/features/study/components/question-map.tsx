import { useId } from 'react';
import { cn } from '@/lib/utils';
import {
	resultLabels,
	type MapItem,
	type QuestionResult,
} from '../question-map';

// full class names, so Tailwind finds them
const resultTones: Record<QuestionResult, string> = {
	correct: 'bg-tone-green text-tone-green-foreground',
	wrong: 'bg-tone-red text-tone-red-foreground',
	skipped: 'bg-muted text-muted-foreground line-through',
	waiting: 'border border-border text-muted-foreground',
};

const legend: { result: QuestionResult; label: string }[] = [
	{ result: 'correct', label: 'Right' },
	{ result: 'wrong', label: 'Wrong' },
	{ result: 'skipped', label: 'Skipped' },
];

// one numbered square per question, coloured by how it went, the shown one ringed
export function QuestionMap({
	items,
	className,
}: {
	items: MapItem[];
	className?: string;
}) {
	const titleId = useId();

	return (
		<section
			aria-labelledby={titleId}
			className={cn('flex flex-col gap-3', className)}
		>
			<h2 id={titleId} className="text-sm font-medium text-muted-foreground">
				Questions
			</h2>
			<ol className="grid grid-cols-[repeat(auto-fill,minmax(2rem,1fr))] gap-1.5">
				{items.map(({ number, result, current }) => (
					<li
						key={number}
						aria-current={current ? 'step' : undefined}
						className={cn(
							'flex aspect-square items-center justify-center rounded-lg text-xs font-medium tabular-nums transition-colors duration-300 motion-reduce:transition-none',
							resultTones[result],
							current &&
								'ring-2 ring-primary ring-offset-2 ring-offset-background'
						)}
					>
						{number}
						<span className="sr-only">: {resultLabels[result]}</span>
					</li>
				))}
			</ol>
			<ul
				aria-hidden="true"
				className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground"
			>
				{legend.map(({ result, label }) => (
					<li key={result} className="flex items-center gap-1.5">
						<span
							className={cn('size-2.5 rounded-[3px]', resultTones[result])}
						/>
						{label}
					</li>
				))}
			</ul>
		</section>
	);
}
