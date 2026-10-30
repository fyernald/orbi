'use client';

import { INTERESTS_MAX, type OnboardingAnswers } from '@orbi/shared';
import { useController, type Control } from 'react-hook-form';
import { FieldError } from '@/components/ui/field';
import { interestSuggestions } from '../choices';
import { AddInterestInput } from './add-interest-input';
import { SuggestionPill } from './suggestion-pill';

export function InterestsStep({
	control,
}: {
	control: Control<OnboardingAnswers>;
}) {
	const { field, fieldState } = useController({ control, name: 'interests' });
	const interests = field.value ?? [];
	const full = interests.length >= INTERESTS_MAX;
	// the student's own interests show up next to the suggestions
	const own = interests.filter((item) => !interestSuggestions.includes(item));

	// typing a suggestion picks the suggestion, so it never shows up twice
	const add = (interest: string) => {
		const suggested = interestSuggestions.find(
			(item) => item.toLowerCase() === interest.toLowerCase()
		);
		field.onChange([...interests, suggested ?? interest]);
	};

	const toggle = (interest: string) =>
		field.onChange(
			interests.includes(interest)
				? interests.filter((item) => item !== interest)
				: [...interests, interest]
		);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap gap-2">
				{[...interestSuggestions, ...own].map((interest, index) => {
					const selected = interests.includes(interest);
					return (
						<SuggestionPill
							key={interest}
							label={interest}
							selected={selected}
							disabled={full && !selected}
							order={index}
							onClick={() => toggle(interest)}
						/>
					);
				})}
			</div>
			<AddInterestInput interests={interests} full={full} onAdd={add} />
			<div className="flex flex-col gap-1">
				<p aria-live="polite" className="text-sm text-muted-foreground">
					{interests.length} of {INTERESTS_MAX} picked
				</p>
				<FieldError errors={[fieldState.error]} />
			</div>
		</div>
	);
}
