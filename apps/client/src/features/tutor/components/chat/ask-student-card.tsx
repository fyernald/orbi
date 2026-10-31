'use client';

import { ASK_STUDENT_ANSWER_MAX_LENGTH } from '@orbi/shared';
import { CornerDownRight } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Thinking } from './thinking';
import type { ToolViewProps } from './tool-views';

const OTHER = 'other';

// the askStudent tool: one question with a few answers, a box for their own, and a
// way to let Orbi decide; the reply goes on once they answer
export function AskStudentCard({
	part,
	interactive,
	actions,
}: ToolViewProps<'askStudent'>) {
	const id = useId();
	const [choice, setChoice] = useState<string | null>(null);
	const [own, setOwn] = useState('');

	if (part.state === 'input-streaming') {
		return <Thinking label="Orbi has a question for you…" />;
	}
	if (part.state === 'output-error') return null;

	const { question, options } = part.input;

	if (part.state === 'output-available') {
		return (
			<p className="flex items-start gap-2 text-sm text-muted-foreground">
				<CornerDownRight className="mt-0.5 size-4 shrink-0" />
				<span>
					{question}{' '}
					<span className="font-medium text-foreground">
						{part.output.skipped
							? 'You let Orbi decide.'
							: `You chose: ${part.output.answer}`}
					</span>
				</span>
			</p>
		);
	}

	const answer = choice === OTHER ? own.trim() : (choice ?? '');
	const submit = (event: FormEvent) => {
		event.preventDefault();
		if (!answer) return;
		actions.answer(part.toolCallId, { answer, skipped: false });
	};

	return (
		<form
			onSubmit={submit}
			aria-labelledby={`${id}-question`}
			className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
		>
			<p id={`${id}-question`} className="text-[15px] font-medium">
				{question}
			</p>
			<fieldset disabled={!interactive} className="flex flex-col gap-1.5">
				<legend className="sr-only">Your answer</legend>
				{[...options, OTHER].map((option) => (
					<label
						key={option}
						className={cn(
							'flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors has-checked:border-primary has-checked:bg-accent has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-disabled:cursor-default has-disabled:opacity-60'
						)}
					>
						<input
							type="radio"
							name={`${id}-answer`}
							value={option}
							checked={choice === option}
							onChange={() => setChoice(option)}
							className="accent-primary"
						/>
						{option === OTHER ? 'Something else' : option}
					</label>
				))}
				{choice === OTHER && (
					<>
						<label htmlFor={`${id}-own`} className="sr-only">
							Your own answer
						</label>
						<textarea
							id={`${id}-own`}
							value={own}
							onChange={(event) => setOwn(event.target.value)}
							maxLength={ASK_STUDENT_ANSWER_MAX_LENGTH}
							rows={2}
							autoFocus
							placeholder="Write your answer"
							className="field-sizing-content min-h-16 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
						/>
					</>
				)}
			</fieldset>
			{interactive && (
				<div className="flex flex-wrap justify-end gap-2">
					<Button
						type="button"
						variant="ghost"
						onClick={() =>
							actions.answer(part.toolCallId, { answer: '', skipped: true })
						}
						className="h-8 rounded-lg px-3 text-muted-foreground"
					>
						Skip, you decide
					</Button>
					<Button
						type="submit"
						disabled={!answer}
						className="h-8 rounded-lg px-3"
					>
						Continue
					</Button>
				</div>
			)}
		</form>
	);
}
