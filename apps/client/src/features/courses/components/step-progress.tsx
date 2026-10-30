import { Check, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NewCourseStep } from '../new-course-steps';

type StepProgressProps = {
	steps: NewCourseStep[];
	current: number;
	// only finished steps can be opened again; the next one needs the Next button
	onSelect: (index: number) => void;
};

export function StepProgress({ steps, current, onSelect }: StepProgressProps) {
	const percent = ((current + 1) / steps.length) * 100;

	return (
		<aside className="flex flex-col gap-5 lg:w-64 lg:shrink-0">
			<div className="flex flex-col gap-2">
				<p className="text-sm font-medium">
					Step {current + 1} of {steps.length}
					<span className="font-normal text-muted-foreground lg:hidden">
						{' '}
						· {steps[current]!.title}
					</span>
				</p>
				<div
					role="progressbar"
					aria-label="Course setup"
					aria-valuemin={1}
					aria-valuemax={steps.length}
					aria-valuenow={current + 1}
					className="h-1.5 overflow-hidden rounded-full bg-muted"
				>
					<div
						className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
						style={{ width: `${percent}%` }}
					/>
				</div>
			</div>

			<ol className="hidden flex-col gap-1.5 lg:flex">
				{steps.map((step, index) => {
					const done = index < current;
					const active = index === current;
					return (
						<li key={step.title}>
							<button
								type="button"
								onClick={() => onSelect(index)}
								disabled={!done}
								aria-current={active ? 'step' : undefined}
								className={cn(
									'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
									active
										? 'border-primary/30 bg-primary/5'
										: 'border-transparent',
									done && 'hover:bg-muted'
								)}
							>
								<span
									className={cn(
										'flex size-7 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold tabular-nums',
										active &&
											'border-primary bg-primary text-primary-foreground',
										done && 'border-primary/30 bg-primary/10 text-primary',
										!active && !done && 'border-border text-muted-foreground'
									)}
								>
									{done ? <Check className="size-3.5" /> : index + 1}
								</span>
								<span className="flex flex-col">
									<span
										className={cn(
											'text-sm font-medium',
											!active && !done && 'text-muted-foreground'
										)}
									>
										{step.title}
									</span>
									<span className="text-xs text-muted-foreground">
										{step.hint}
									</span>
								</span>
							</button>
						</li>
					);
				})}
			</ol>

			<p className="hidden gap-2.5 rounded-xl border border-primary/15 bg-accent p-3.5 text-sm text-accent-foreground lg:flex">
				<Lightbulb className="mt-0.5 size-4 shrink-0" />
				{steps[current]!.tip}
			</p>
		</aside>
	);
}
