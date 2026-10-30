'use client';

import type { OnboardingAnswers } from '@orbi/shared';
import { useEffect } from 'react';
import { useController, type Control } from 'react-hook-form';
import { FieldError } from '@/components/ui/field';
import { browserTimeZone } from '../time-zones';
import { TimeZoneCard } from './time-zone-card';
import { TimeZoneSelect } from './time-zone-select';

// starts on the browser's zone, so most students only have to confirm it
export function TimeZoneStep({
	control,
}: {
	control: Control<OnboardingAnswers>;
}) {
	const { field, fieldState } = useController({ control, name: 'timezone' });
	const { value, onChange } = field;

	useEffect(() => {
		if (!value) onChange(browserTimeZone());
	}, [value, onChange]);

	if (!value) return null;

	return (
		<div className="flex flex-col gap-6">
			<TimeZoneCard zone={value} />
			<TimeZoneSelect value={value} onChange={onChange} />
			<FieldError errors={[fieldState.error]} />
		</div>
	);
}
