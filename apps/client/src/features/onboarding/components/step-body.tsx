'use client';

import type { OnboardingAnswers } from '@orbi/shared';
import type { Control } from 'react-hook-form';
import type { OnboardingStep } from '../steps';
import { BirthDateStep } from './birth-date-step';
import { ChoiceStep } from './choice-step';
import { FieldOfStudyStep } from './field-of-study-step';
import { InterestsStep } from './interests-step';
import { PreferredNameStep } from './preferred-name-step';
import { TimeZoneStep } from './time-zone-step';

type StepBodyProps = {
	step: Exclude<OnboardingStep, { kind: 'welcome' }>;
	control: Control<OnboardingAnswers>;
	onPicked: () => void;
	onSuggestField: (field: string) => void;
};

// the answer part of a question, by its kind
export function StepBody({
	step,
	control,
	onPicked,
	onSuggestField,
}: StepBodyProps) {
	switch (step.kind) {
		case 'choice':
			return <ChoiceStep control={control} step={step} onPicked={onPicked} />;
		case 'preferredName':
			return <PreferredNameStep control={control} />;
		case 'birthDate':
			return <BirthDateStep control={control} />;
		case 'fieldOfStudy':
			return <FieldOfStudyStep control={control} onSuggest={onSuggestField} />;
		case 'interests':
			return <InterestsStep control={control} />;
		case 'timezone':
			return <TimeZoneStep control={control} />;
	}
}
