'use client';

import { INTEREST_MAX_LENGTH, interestName } from '@orbi/shared';
import { Plus } from 'lucide-react';
import { useId, useState, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AddInterestInputProps = {
	interests: string[];
	full: boolean;
	onAdd: (interest: string) => void;
};

// Enter adds what was typed; with nothing typed, Enter is left to the form so it goes on
export function AddInterestInput({
	interests,
	full,
	onAdd,
}: AddInterestInputProps) {
	const [draft, setDraft] = useState('');
	const [problem, setProblem] = useState<string | null>(null);
	const id = useId();

	const add = () => {
		const parsed = interestName.safeParse(draft);
		if (!parsed.success) {
			setProblem(parsed.error.issues[0]?.message ?? 'Enter an interest.');
			return;
		}
		const taken = interests.some(
			(item) => item.toLowerCase() === parsed.data.toLowerCase()
		);
		if (taken) {
			setProblem('This one is already picked.');
			return;
		}
		onAdd(parsed.data);
		setDraft('');
		setProblem(null);
	};

	const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter' && draft.trim() !== '') {
			event.preventDefault();
			add();
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<label htmlFor={id} className="sr-only">
				Add your own interest
			</label>
			<div
				className={cn(
					'flex h-12 items-center gap-2 rounded-xl border border-input bg-card/70 pr-1.5 pl-4 backdrop-blur-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
					problem && 'border-destructive ring-3 ring-destructive/20'
				)}
			>
				<input
					id={id}
					value={draft}
					onChange={(event) => {
						setDraft(event.target.value);
						setProblem(null);
					}}
					onKeyDown={onKeyDown}
					disabled={full}
					maxLength={INTEREST_MAX_LENGTH}
					placeholder={full ? 'That is plenty' : 'Add your own'}
					autoComplete="off"
					aria-invalid={problem ? true : undefined}
					aria-describedby={problem ? `${id}-problem` : undefined}
					className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
				/>
				<Button
					type="button"
					variant="ghost"
					onClick={add}
					disabled={full || draft.trim() === ''}
					className="h-9 rounded-full px-3"
				>
					<Plus />
					Add
				</Button>
			</div>
			{problem && (
				<p id={`${id}-problem`} className="text-sm text-destructive">
					{problem}
				</p>
			)}
		</div>
	);
}
