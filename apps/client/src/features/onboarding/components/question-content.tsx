'use client';

import type { OnboardingAnswers } from '@orbi/shared';
import type { Control } from 'react-hook-form';
import type { OnboardingStep } from '../steps';
import { QuestionHeader } from './question-header';
import { StepBody } from './step-body';
import { WelcomeStep } from './welcome-step';

type QuestionContentProps = {
	step: OnboardingStep;
	name: string;
	questions: number;
	control: Control<OnboardingAnswers>;
	onPicked: () => void;
	onSuggestField: (field: string) => void;
};

// what one screen of onboarding shows: the welcome, or a question with its answers
export function QuestionContent({
	step,
	name,
	questions,
	control,
	onPicked,
	onSuggestField,
}: QuestionContentProps) {
	if (step.kind === 'welcome') {
		return <WelcomeStep name={name} questions={questions} />;
	}

	return (
		<>
			<QuestionHeader
				heading={step.heading}
				why={step.why}
				focusOnShow={!('focusInput' in step && step.focusInput)}
			/>
			<StepBody
				step={step}
				control={control}
				onPicked={onPicked}
				onSuggestField={onSuggestField}
			/>
		</>
	);
}
