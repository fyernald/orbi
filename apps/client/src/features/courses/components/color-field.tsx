'use client';

import {
	COURSE_COLORS,
	type CourseColor,
	type CreateCourseInput,
} from '@orbi/shared';
import { Check } from 'lucide-react';
import { useController, useWatch, type Control } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { CourseBadge } from './course-badge';

// the strong shade of each tone, so the swatches are easy to tell apart
const swatchClasses: Record<CourseColor, string> = {
	blue: 'bg-tone-blue-foreground ring-tone-blue-foreground',
	teal: 'bg-tone-teal-foreground ring-tone-teal-foreground',
	green: 'bg-tone-green-foreground ring-tone-green-foreground',
	amber: 'bg-tone-amber-foreground ring-tone-amber-foreground',
	red: 'bg-tone-red-foreground ring-tone-red-foreground',
};

const colorNames: Record<CourseColor, string> = {
	blue: 'Blue',
	teal: 'Teal',
	green: 'Green',
	amber: 'Amber',
	red: 'Red',
};

// colour swatches, with a preview of how the course shows in the sidebar
export function ColorField({
	control,
}: {
	control: Control<CreateCourseInput>;
}) {
	const { field } = useController({ control, name: 'color' });
	const name = useWatch({ control, name: 'name' });

	return (
		<fieldset>
			<legend className="mb-3 text-sm font-medium">Colour</legend>
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex flex-wrap gap-2.5">
					{COURSE_COLORS.map((color, index) => {
						const checked = field.value === color;
						return (
							<label key={color} className="cursor-pointer">
								<input
									ref={index === 0 ? field.ref : undefined}
									type="radio"
									name={field.name}
									value={color}
									checked={checked}
									onChange={() => field.onChange(color)}
									onBlur={field.onBlur}
									className="peer sr-only"
								/>
								<span
									aria-hidden="true"
									className={cn(
										'flex size-9 items-center justify-center rounded-full text-white ring-offset-2 ring-offset-card transition-shadow peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50',
										swatchClasses[color],
										checked && 'ring-2'
									)}
								>
									{checked && <Check className="size-4" strokeWidth={2.5} />}
								</span>
								<span className="sr-only">{colorNames[color]}</span>
							</label>
						);
					})}
				</div>
				<div
					aria-hidden="true"
					className="flex min-w-0 items-center gap-2.5 rounded-xl border border-dashed border-border px-3 py-2 text-sm"
				>
					<CourseBadge
						course={{ name: name || 'Course', color: field.value }}
					/>
					<span className="max-w-40 truncate text-muted-foreground">
						{name || 'Your course'}
					</span>
				</div>
			</div>
		</fieldset>
	);
}
