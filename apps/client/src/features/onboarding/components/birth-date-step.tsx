'use client';

import type { OnboardingAnswers } from '@orbi/shared';
import { useMemo, useState, type CSSProperties } from 'react';
import { useController, type Control } from 'react-hook-form';
import { FieldError } from '@/components/ui/field';
import { useBrowserValue } from '@/hooks/use-browser-value';
import {
	ageOn,
	birthYears,
	daysInMonth,
	toBirthDate,
	toDateParts,
	type DateParts,
} from '../birth-date';
import { SelectBox } from './select-box';

const monthName = new Intl.DateTimeFormat('en-GB', { month: 'long' });

const months = Array.from({ length: 12 }, (_, index) => ({
	value: String(index + 1),
	label: monthName.format(new Date(2000, index, 1)),
}));

const asOptions = (values: number[]) =>
	values.map((value) => ({ value: String(value), label: String(value) }));

// day, month, and year apart, which is quicker than paging a calendar back twenty years
export function BirthDateStep({
	control,
}: {
	control: Control<OnboardingAnswers>;
}) {
	const { field, fieldState } = useController({ control, name: 'birthDate' });
	const [parts, setParts] = useState<DateParts>(() => toDateParts(field.value));
	const years = useMemo(() => asOptions(birthYears(new Date())), []);
	const days = asOptions(
		Array.from(
			{ length: daysInMonth(parts.month, parts.year) },
			(_, index) => index + 1
		)
	);
	const age = useBrowserValue(() =>
		field.value && !fieldState.invalid ? ageOn(field.value, new Date()) : null
	);
	// no error while the student is still picking the parts
	const picked = Boolean(parts.day && parts.month && parts.year);

	// the form gets a date only once all three parts make a real day
	const update = (change: DateParts) => {
		const next = { ...parts, ...change };
		if (next.day && next.day > daysInMonth(next.month, next.year)) {
			next.day = undefined;
		}
		setParts(next);
		field.onChange(toBirthDate(next));
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-[1fr_1.6fr_1.2fr] gap-3">
				<SelectBox
					label="Day"
					value={parts.day ? String(parts.day) : ''}
					options={days}
					placeholder="Day"
					order={0}
					onChange={(day) => update({ day: Number(day) })}
				/>
				<SelectBox
					label="Month"
					value={parts.month ? String(parts.month) : ''}
					options={months}
					placeholder="Month"
					order={1}
					onChange={(month) => update({ month: Number(month) })}
				/>
				<SelectBox
					label="Year"
					value={parts.year ? String(parts.year) : ''}
					options={years}
					placeholder="Year"
					order={2}
					onChange={(year) => update({ year: Number(year) })}
				/>
			</div>
			{age !== null && (
				<p
					style={{ '--stagger': 0 } as CSSProperties}
					className="stagger-in text-sm text-muted-foreground"
				>
					You are {age}.
				</p>
			)}
			{picked && <FieldError errors={[fieldState.error]} />}
		</div>
	);
}
