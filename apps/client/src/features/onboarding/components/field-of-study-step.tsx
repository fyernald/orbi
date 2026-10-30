'use client';

import {
	FIELD_OF_STUDY_MAX_LENGTH,
	type OnboardingAnswers,
} from '@orbi/shared';
import { useWatch, type Control } from 'react-hook-form';
import { TextField } from '@/components/form/text-field';
import { fieldSuggestions } from '../choices';
import { SuggestionPill } from './suggestion-pill';

type FieldOfStudyStepProps = {
	control: Control<OnboardingAnswers>;
	onSuggest: (field: string) => void;
};

export function FieldOfStudyStep({
	control,
	onSuggest,
}: FieldOfStudyStepProps) {
	const current = useWatch({ control, name: 'fieldOfStudy' })?.trim();

	return (
		<div className="flex flex-col gap-6">
			<TextField
				control={control}
				name="fieldOfStudy"
				label="Field of study"
				placeholder="e.g. Computer Engineering"
				autoFocus
				autoComplete="off"
				maxLength={FIELD_OF_STUDY_MAX_LENGTH}
				className="h-12 rounded-xl bg-card/70 px-4 text-base backdrop-blur-sm md:text-base"
			/>
			<div className="flex flex-col gap-3">
				<p className="text-sm text-muted-foreground">Or pick one</p>
				<div className="flex flex-wrap gap-2">
					{fieldSuggestions.map((suggestion, index) => (
						<SuggestionPill
							key={suggestion}
							label={suggestion}
							selected={current === suggestion}
							order={index}
							onClick={() => onSuggest(suggestion)}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
