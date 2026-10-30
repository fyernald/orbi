'use client';

import type { OnboardingAnswers } from '@orbi/shared';
import { useController, type Control } from 'react-hook-form';
import { FieldError } from '@/components/ui/field';
import type { Choice, OnboardingStep } from '../steps';
import { ChoiceGroup } from './choice-group';

type ChoiceStepProps = {
	control: Control<OnboardingAnswers>;
	step: Extract<OnboardingStep, { kind: 'choice' }>;
	// a question with one answer moves on by itself after the pick
	onPicked: () => void;
};

type ChoiceValue = Choice['value'];

export function ChoiceStep({ control, step, onPicked }: ChoiceStepProps) {
	const { field, fieldState } = useController({
		control,
		name: step.fields[0],
	});
	const multiple = step.max > 1;
	const value = field.value as ChoiceValue | ChoiceValue[] | undefined;
	const selected = Array.isArray(value)
		? value
		: value === undefined
			? []
			: [value];

	const pick = (choice: ChoiceValue) => {
		if (!multiple) {
			field.onChange(choice);
			onPicked();
			return;
		}
		if (selected.includes(choice)) {
			field.onChange(selected.filter((item) => item !== choice));
		} else if (selected.length < step.max) {
			field.onChange([...selected, choice]);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<ChoiceGroup
				legend={step.heading}
				choices={step.choices}
				selected={selected}
				max={step.max}
				onPick={pick}
			/>
			<FieldError errors={[fieldState.error]} />
		</div>
	);
}
