'use client';

import {
	PREFERRED_NAME_MAX_LENGTH,
	type OnboardingAnswers,
} from '@orbi/shared';
import { useWatch, type Control } from 'react-hook-form';
import { TextField } from '@/components/form/text-field';
import { GreetingPreview } from './greeting-preview';

// starts with the first name of the account, so most students only confirm it
export function PreferredNameStep({
	control,
}: {
	control: Control<OnboardingAnswers>;
}) {
	const name = useWatch({ control, name: 'preferredName' })?.trim() ?? '';

	return (
		<div className="flex flex-col gap-6">
			<TextField
				control={control}
				name="preferredName"
				label="Your name"
				placeholder="e.g. Ada"
				autoFocus
				autoComplete="nickname"
				maxLength={PREFERRED_NAME_MAX_LENGTH}
				className="h-12 rounded-xl bg-card/70 px-4 text-base backdrop-blur-sm md:text-base"
			/>
			<GreetingPreview name={name} />
		</div>
	);
}
