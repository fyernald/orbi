'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
	onboardingAnswers,
	type OnboardingAnswers,
	type Profile,
} from '@orbi/shared';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, type FormEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { FormError } from '@/components/form/form-error';
import { apiErrorMessage } from '@/lib/api';
import { routes } from '@/lib/routes';
import { transitionTypes } from '@/lib/transitions';
import { allSetSummary } from '../all-set-summary';
import { useFinishOnboarding, useSaveAnswers } from '../hooks';
import {
	firstOpenStep,
	isAnswered,
	onboardingSteps,
	toFormValues,
} from '../steps';
import { useEnterToSubmit } from '../use-enter-to-submit';
import { useStepTransition } from '../use-step-transition';
import { AllSetStep } from './all-set-step';
import { OnboardingFooter } from './onboarding-footer';
import { OnboardingProgress } from './onboarding-progress';
import { OnboardingScreen } from './onboarding-screen';
import { OnboardingSky } from './onboarding-sky';
import { QuestionContent } from './question-content';
import { StepTransition } from './step-transition';

// time to see the picked card before a one-answer question moves on
const AUTO_ADVANCE_MS = 320;

const lastStep = onboardingSteps.length - 1;
// the welcome screen is not a question
const questionCount = onboardingSteps.length - 1;
// the "all set" screen comes after the last question
const allSetIndex = onboardingSteps.length;

type OnboardingFlowProps = {
	saved: Profile;
	name: string;
};

// One form for every question. Next checks only the current question and saves it,
// so a refresh comes back to the first question without an answer.
export function OnboardingFlow({ saved, name }: OnboardingFlowProps) {
	const router = useRouter();
	const save = useSaveAnswers();
	const finish = useFinishOnboarding();
	const form = useForm<OnboardingAnswers>({
		resolver: zodResolver(onboardingAnswers),
		mode: 'onChange',
		defaultValues: toFormValues(saved, name),
	});
	const { index, direction, leaving, go } = useStepTransition(
		firstOpenStep(onboardingSteps, saved)
	);
	const values = useWatch({ control: form.control });
	const autoAdvance = useRef<number | undefined>(undefined);
	useEffect(() => () => window.clearTimeout(autoAdvance.current), []);
	const formRef = useRef<HTMLFormElement>(null);
	useEnterToSubmit(formRef);

	const allSet = index === allSetIndex;
	const step = onboardingSteps[Math.min(index, lastStep)]!;
	const isLast = index === lastStep;
	const pending = save.isPending || finish.isPending || finish.isSuccess;

	// the app loads while the student enjoys the "all set" screen
	useEffect(() => {
		if (allSet) router.prefetch(routes.app);
	}, [allSet, router]);

	const next = async () => {
		if (pending || leaving || allSet) return;
		if (step.kind === 'welcome') return go(index + 1);
		if (!(await form.trigger(step.fields))) return;

		const answers = Object.fromEntries(
			step.fields.map((field) => [field, form.getValues(field)])
		);
		save.mutate(answers, {
			onSuccess: () => {
				if (!isLast) return go(index + 1);
				finish.mutate(undefined, { onSuccess: () => go(allSetIndex) });
			},
		});
	};

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void next();
	};

	const onPicked = () => {
		window.clearTimeout(autoAdvance.current);
		autoAdvance.current = window.setTimeout(() => void next(), AUTO_ADVANCE_MS);
	};

	const footer = {
		label:
			step.kind === 'welcome' ? 'Let’s go' : isLast ? 'Finish' : 'Continue',
		hint:
			step.kind === 'welcome'
				? 'to start'
				: isLast
					? 'to finish'
					: 'to continue',
	};

	return (
		<form ref={formRef} onSubmit={onSubmit} noValidate>
			<OnboardingScreen
				sky={
					<OnboardingSky
						step={index}
						progress={Math.min(index, questionCount) / questionCount}
						finished={allSet}
					/>
				}
				progress={
					step.kind === 'welcome' || allSet ? (
						<div className="h-9" />
					) : (
						<OnboardingProgress
							current={index}
							total={questionCount}
							onBack={() => go(index - 1)}
						/>
					)
				}
				footer={
					allSet ? undefined : (
						<OnboardingFooter
							label={footer.label}
							hint={footer.hint}
							ready={isAnswered(step.fields, values)}
							pending={pending}
						/>
					)
				}
			>
				<StepTransition
					stepKey={allSet ? 'all-set' : step.id}
					direction={direction}
					leaving={leaving}
				>
					{allSet ? (
						<AllSetStep
							greeting={form.getValues('preferredName')}
							summary={allSetSummary(form.getValues())}
							onDone={() =>
								router.replace(routes.app, {
									transitionTypes: [transitionTypes.enterApp],
								})
							}
						/>
					) : (
						<>
							<FormError
								message={apiErrorMessage(save.error ?? finish.error)}
							/>
							<QuestionContent
								step={step}
								name={name}
								questions={questionCount}
								control={form.control}
								onPicked={onPicked}
								onSuggestField={(field) =>
									form.setValue('fieldOfStudy', field, {
										shouldValidate: true,
									})
								}
							/>
						</>
					)}
				</StepTransition>
			</OnboardingScreen>
		</form>
	);
}
