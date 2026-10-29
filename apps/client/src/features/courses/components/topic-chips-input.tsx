'use client';

import { FIRST_TOPICS_MAX, topicName } from '@orbi/shared';
import { ListPlus, Plus, X } from 'lucide-react';
import { useId, useState, type KeyboardEvent, type Ref } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { KeyHint } from './key-hint';

type TopicChipsInputProps = {
	value: string[];
	onChange: (topics: string[]) => void;
	inputRef?: Ref<HTMLInputElement>;
	error?: string;
};

// Enter adds the typed topic as a chip, and Backspace in the empty input removes
// the last one. Enter in the empty input is left to the form, so it creates the course.
export function TopicChipsInput({
	value,
	onChange,
	inputRef,
	error,
}: TopicChipsInputProps) {
	const [draft, setDraft] = useState('');
	const [problem, setProblem] = useState<string | null>(null);
	const id = useId();
	const messageId = `${id}-message`;
	const full = value.length >= FIRST_TOPICS_MAX;

	const add = () => {
		const parsed = topicName.safeParse(draft);
		if (!parsed.success) {
			setProblem(parsed.error.issues[0]?.message ?? 'Enter a topic name.');
			return;
		}
		const name = parsed.data;
		if (value.some((topic) => topic.toLowerCase() === name.toLowerCase())) {
			setProblem('This topic is already in the list.');
			return;
		}
		onChange([...value, name]);
		setDraft('');
		setProblem(null);
	};

	const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter' && draft.trim() !== '') {
			event.preventDefault();
			add();
		}
		if (event.key === 'Backspace' && draft === '' && value.length > 0) {
			onChange(value.slice(0, -1));
		}
	};

	const message = problem ?? error;

	return (
		<div className="flex flex-col gap-2">
			<label htmlFor={id} className="text-sm font-medium">
				Topics
			</label>
			<div
				className={cn(
					'flex flex-wrap items-center gap-2 rounded-xl border border-input px-3 py-2 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
					message && 'border-destructive ring-3 ring-destructive/20'
				)}
			>
				<ListPlus aria-hidden="true" className="size-4 text-muted-foreground" />
				{value.map((topic) => (
					<span
						key={topic}
						className="flex h-8 max-w-full items-center gap-1 rounded-full bg-muted pr-1 pl-3 text-sm"
					>
						<span className="truncate">{topic}</span>
						<button
							type="button"
							onClick={() => onChange(value.filter((item) => item !== topic))}
							aria-label={`Remove ${topic}`}
							className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
						>
							<X className="size-3.5" />
						</button>
					</span>
				))}
				<input
					ref={inputRef}
					id={id}
					value={draft}
					onChange={(event) => {
						setDraft(event.target.value);
						setProblem(null);
					}}
					onKeyDown={onKeyDown}
					disabled={full}
					placeholder={
						full
							? 'That is enough for now'
							: value.length === 0
								? 'e.g. Cell division'
								: 'Add another topic'
					}
					autoComplete="off"
					aria-invalid={message ? true : undefined}
					aria-describedby={messageId}
					className="h-8 min-w-36 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm"
				/>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={add}
					disabled={full || draft.trim() === ''}
					className="rounded-full"
				>
					<Plus />
					Add
				</Button>
			</div>
			<div
				id={messageId}
				className={cn(
					'flex flex-wrap items-center gap-x-4 gap-y-1 text-sm',
					message ? 'text-destructive' : 'text-muted-foreground'
				)}
			>
				{message ?? (
					<>
						<span>
							{value.length} of {FIRST_TOPICS_MAX} topics
						</span>
						<span className="hidden items-center gap-1.5 sm:flex">
							<KeyHint>Enter</KeyHint> adds a topic
						</span>
						<span className="hidden items-center gap-1.5 sm:flex">
							<KeyHint>Backspace</KeyHint> removes the last one
						</span>
					</>
				)}
			</div>
		</div>
	);
}
