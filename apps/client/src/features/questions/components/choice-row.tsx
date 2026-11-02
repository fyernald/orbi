'use client';

import { CHOICE_MAX_LENGTH } from '@orbi/shared';
import { Check, X } from 'lucide-react';
import { useId } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { choiceLetter } from '../choices';

type ChoiceRowProps = {
	index: number;
	value: string;
	onChange: (value: string) => void;
	// the radio group that marks the correct option
	groupName: string;
	correct: boolean;
	onMarkCorrect: () => void;
	// missing when the question has the fewest options it can have
	onRemove?: () => void;
	error?: string;
	autoFocus?: boolean;
};

// one option: a round button marks it correct, like an answer key in Google Forms
export function ChoiceRow({
	index,
	value,
	onChange,
	groupName,
	correct,
	onMarkCorrect,
	onRemove,
	error,
	autoFocus,
}: ChoiceRowProps) {
	const id = useId();
	const letter = choiceLetter(index);

	return (
		<li className="flex flex-col gap-1">
			<div
				className={cn(
					'flex items-center gap-2 rounded-lg border border-input pr-1 pl-2 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30',
					correct &&
						'border-tone-green-foreground/40 bg-tone-green dark:bg-tone-green',
					error &&
						'border-destructive ring-3 ring-destructive/20 focus-within:border-destructive focus-within:ring-destructive/20'
				)}
			>
				<label className="flex size-7 shrink-0 cursor-pointer items-center justify-center">
					<input
						type="radio"
						name={groupName}
						checked={correct}
						onChange={onMarkCorrect}
						className="peer sr-only"
					/>
					<span
						aria-hidden
						className="flex size-[18px] items-center justify-center rounded-full border-2 border-input text-background transition-colors peer-checked:border-tone-green-foreground peer-checked:bg-tone-green-foreground peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
					>
						<Check className="size-3" strokeWidth={3} />
					</span>
					<span className="sr-only">Option {letter} is correct</span>
				</label>
				<span
					aria-hidden
					className="w-3 shrink-0 text-xs font-medium text-muted-foreground"
				>
					{letter}
				</span>
				<input
					type="text"
					value={value}
					onChange={(event) => onChange(event.target.value)}
					autoFocus={autoFocus}
					aria-label={`Option ${letter}`}
					aria-invalid={error ? true : undefined}
					aria-describedby={error ? `${id}-error` : undefined}
					maxLength={CHOICE_MAX_LENGTH}
					autoComplete="off"
					placeholder={`Option ${letter}`}
					className="h-10 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm"
				/>
				{correct && (
					<span className="shrink-0 text-xs font-medium text-tone-green-foreground">
						Correct
					</span>
				)}
				{onRemove && (
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						onClick={onRemove}
						aria-label={`Remove option ${letter}`}
						className="shrink-0 rounded-md text-muted-foreground"
					>
						<X />
					</Button>
				)}
			</div>
			{error && (
				<p id={`${id}-error`} className="px-1 text-xs text-destructive">
					{error}
				</p>
			)}
		</li>
	);
}
