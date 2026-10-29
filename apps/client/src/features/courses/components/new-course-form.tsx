'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createCourseInput, type CreateCourseInput } from '@orbi/shared';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { FormError } from '@/components/form/form-error';
import { apiErrorMessage } from '@/lib/api';
import { courseRoute, routes } from '@/lib/routes';
import { useCreateCourse } from '../hooks';
import { newCourseSteps } from '../new-course-steps';
import { DetailsStep } from './details-step';
import { GoalStep } from './goal-step';
import { StepCard } from './step-card';
import { StepFooter } from './step-footer';
import { StepProgress } from './step-progress';
import { TopicsStep } from './topics-step';

// one form for all steps; Next checks only the fields of the current step,
// and nothing is saved until the last step
export function NewCourseForm() {
	const router = useRouter();
	const create = useCreateCourse();
	const [step, setStep] = useState(0);
	const form = useForm<CreateCourseInput>({
		resolver: zodResolver(createCourseInput),
		// Next checks one step without submitting, so errors must clear as soon as the value is fixed
		mode: 'onChange',
		defaultValues: {
			name: '',
			description: '',
			color: 'blue',
			examDate: null,
			topics: [],
		},
	});

	const current = newCourseSteps[step]!;
	const isLast = step === newCourseSteps.length - 1;

	// a new step puts the cursor in its first field; the first step uses autoFocus
	const shownStep = useRef(step);
	useEffect(() => {
		if (shownStep.current === step) return;
		shownStep.current = step;
		form.setFocus(newCourseSteps[step]!.fields[0]!);
	}, [step, form]);

	const save = (values: CreateCourseInput) =>
		create.mutate(
			{
				...values,
				// a date picked before switching to another goal is not kept
				examDate:
					values.goal === 'exam_prep' ? (values.examDate ?? null) : null,
			},
			{ onSuccess: (created) => router.push(courseRoute(created.id)) }
		);

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isLast) return form.handleSubmit(save)();
		if (await form.trigger(current.fields)) setStep(step + 1);
	};

	return (
		<form
			onSubmit={onSubmit}
			noValidate
			className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8"
		>
			<StepProgress steps={newCourseSteps} current={step} onSelect={setStep} />
			<StepCard
				heading={current.heading}
				description={current.description}
				footer={
					<StepFooter
						isFirst={step === 0}
						isLast={isLast}
						// stays busy while the course page opens
						pending={create.isPending || create.isSuccess}
						cancelHref={routes.courses}
						onBack={() => setStep(step - 1)}
					/>
				}
			>
				<FormError message={apiErrorMessage(create.error)} />
				{step === 0 && <DetailsStep control={form.control} />}
				{step === 1 && <GoalStep control={form.control} />}
				{step === 2 && <TopicsStep control={form.control} />}
			</StepCard>
		</form>
	);
}
