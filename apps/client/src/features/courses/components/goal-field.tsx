'use client';

import { COURSE_GOALS, type CreateCourseInput } from '@orbi/shared';
import { CircleCheck } from 'lucide-react';
import { useController, type Control } from 'react-hook-form';
import { FieldError } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { goals } from '../goals';

// one big card per goal, chosen like a radio button
export function GoalField({
	control,
}: {
	control: Control<CreateCourseInput>;
}) {
	const { field, fieldState } = useController({ control, name: 'goal' });

	return (
		<fieldset className="flex flex-col gap-3">
			<legend className="sr-only">Goal</legend>
			<div className="grid gap-3 sm:grid-cols-3">
				{COURSE_GOALS.map((goal, index) => {
					const { label, description, icon: Icon } = goals[goal];
					const checked = field.value === goal;
					return (
						<label
							key={goal}
							className={cn(
								'relative flex cursor-pointer flex-col gap-3 rounded-2xl border p-4 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
								checked
									? 'border-primary bg-primary/5'
									: 'border-border hover:bg-muted/60'
							)}
						>
							<input
								ref={index === 0 ? field.ref : undefined}
								type="radio"
								name={field.name}
								value={goal}
								checked={checked}
								onChange={() => field.onChange(goal)}
								onBlur={field.onBlur}
								className="sr-only"
							/>
							<span
								aria-hidden="true"
								className={cn(
									'flex size-10 items-center justify-center rounded-xl transition-colors',
									checked
										? 'bg-primary text-primary-foreground'
										: 'bg-muted text-muted-foreground'
								)}
							>
								<Icon className="size-5" />
							</span>
							<span className="flex flex-col gap-1">
								<span className="font-medium">{label}</span>
								<span className="text-sm text-muted-foreground">
									{description}
								</span>
							</span>
							{checked && (
								<CircleCheck
									aria-hidden="true"
									className="absolute top-3 right-3 size-5 fill-primary text-primary-foreground"
								/>
							)}
						</label>
					);
				})}
			</div>
			<FieldError errors={[fieldState.error]} />
		</fieldset>
	);
}
