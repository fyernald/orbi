'use client';

import { useEffect, useId } from 'react';
import { cn } from '@/lib/utils';
import { isTyping } from '../keyboard';
import type { Choice } from '../steps';
import { ChoiceCard } from './choice-card';

type ChoiceValue = Choice['value'];

type ChoiceGroupProps = {
	legend: string;
	choices: Choice[];
	selected: ChoiceValue[];
	// 1 picks one answer; more lets the student pick up to that many
	max: number;
	onPick: (value: ChoiceValue) => void;
};

// the cards of one question; the number keys pick them too
export function ChoiceGroup({
	legend,
	choices,
	selected,
	max,
	onPick,
}: ChoiceGroupProps) {
	const name = useId();
	const multiple = max > 1;
	const full = multiple && selected.length >= max;

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.metaKey || event.ctrlKey || event.altKey) return;
			if (isTyping(event.target)) return;
			const choice = choices[Number(event.key) - 1];
			if (!choice) return;
			event.preventDefault();
			onPick(choice.value);
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [choices, onPick]);

	return (
		<fieldset className="flex flex-col gap-3">
			<legend className="sr-only">{legend}</legend>
			<div className={cn('grid gap-3', choices.length > 3 && 'sm:grid-cols-2')}>
				{choices.map((choice, index) => {
					const checked = selected.includes(choice.value);
					return (
						<ChoiceCard
							key={choice.value}
							name={name}
							type={multiple ? 'checkbox' : 'radio'}
							label={choice.label}
							description={choice.description}
							icon={choice.icon}
							checked={checked}
							disabled={full && !checked}
							shortcut={index + 1}
							order={index}
							onChange={() => onPick(choice.value)}
						/>
					);
				})}
			</div>
			{multiple && (
				<p aria-live="polite" className="text-sm text-muted-foreground">
					{selected.length} of {max} picked
				</p>
			)}
		</fieldset>
	);
}
