'use client';

import { CHOICES_PER_QUESTION, type QuestionInput } from '@orbi/shared';
import { Plus } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { useWatch, type UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
	canAddChoice,
	canRemoveChoice,
	removeChoice,
	type QuestionFormValues,
} from '../question-form';
import { ChoiceRow } from './choice-row';

type ChoiceFieldsProps = {
	form: UseFormReturn<QuestionFormValues, unknown, QuestionInput>;
};

// the options, with the correct one marked; once the student tried to save, every
// change is checked again, so the message goes as soon as it is fixed
export function ChoiceFields({ form }: ChoiceFieldsProps) {
	const id = useId();
	// a new option takes the focus, so it can be typed in right away
	const [focusLast, setFocusLast] = useState(false);
	const list = useRef<HTMLUListElement>(null);
	const choices = useWatch({ control: form.control, name: 'choices' });
	const correctChoice = useWatch({
		control: form.control,
		name: 'correctChoice',
	});
	const { errors, isSubmitted } = form.formState;
	const options = { shouldValidate: isSubmitted, shouldDirty: true };
	const listError = errors.choices?.message ?? errors.choices?.root?.message;
	const markError = errors.correctChoice?.message;

	const setChoice = (index: number, value: string) =>
		form.setValue(`choices.${index}`, value, options);

	// the removed row's button goes with it, so the focus moves to the option that
	// takes its place, or the last one
	const remove = (index: number) => {
		const next = removeChoice({ choices, correctChoice }, index);
		form.setValue('choices', next.choices, options);
		form.setValue('correctChoice', next.correctChoice, options);
		const focusAt = Math.min(index, next.choices.length - 1);
		requestAnimationFrame(() =>
			list.current
				?.querySelectorAll<HTMLInputElement>('input[type=text]')
				[focusAt]?.focus()
		);
	};

	return (
		<fieldset
			aria-describedby={`${id}-hint`}
			className="flex min-w-0 flex-col gap-2"
		>
			<legend className="mb-2 text-sm font-medium">Options</legend>
			<p id={`${id}-hint`} className="-mt-1 text-xs text-muted-foreground">
				Mark the correct one. Use 2 to {CHOICES_PER_QUESTION} options.
			</p>
			<ul ref={list} className="flex flex-col gap-1.5">
				{choices.map((choice, index) => (
					<ChoiceRow
						key={index}
						index={index}
						value={choice}
						onChange={(value) => setChoice(index, value)}
						groupName={`${id}-correct`}
						correct={correctChoice === index}
						onMarkCorrect={() => form.setValue('correctChoice', index, options)}
						onRemove={
							canRemoveChoice(choices) ? () => remove(index) : undefined
						}
						error={errors.choices?.[index]?.message}
						autoFocus={focusLast && index === choices.length - 1}
					/>
				))}
			</ul>
			{(listError || markError) && (
				<div role="alert" className="flex flex-col gap-0.5 px-1">
					{[listError, markError].filter(Boolean).map((message) => (
						<p key={message} className="text-xs text-destructive">
							{message}
						</p>
					))}
				</div>
			)}
			{canAddChoice(choices) && (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => {
						setFocusLast(true);
						form.setValue('choices', [...choices, ''], { shouldDirty: true });
					}}
					className="self-start rounded-lg text-muted-foreground"
				>
					<Plus />
					Add option
				</Button>
			)}
		</fieldset>
	);
}
