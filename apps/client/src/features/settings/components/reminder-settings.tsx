'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { reminderSettings, type ReminderSettings } from '@orbi/shared';
import { CheckIcon } from 'lucide-react';
import { useId } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FormError } from '@/components/form/form-error';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { apiErrorMessage } from '@/lib/api';
import { useSaveReminder } from '../hooks';

type ReminderSettingsCardProps = {
	saved: ReminderSettings;
	timezone: string | null;
};

export function ReminderSettingsCard({
	saved,
	timezone,
}: ReminderSettingsCardProps) {
	const save = useSaveReminder();
	const form = useForm<ReminderSettings>({
		resolver: zodResolver(reminderSettings),
		defaultValues: saved,
	});
	const switchId = useId();
	const timeId = useId();
	const enabled = form.watch('reminderEnabled');
	const { isDirty } = form.formState;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Daily study reminder</CardTitle>
				<CardDescription>
					An email on days you have not studied yet, with how many questions are
					due.
				</CardDescription>
			</CardHeader>
			<form
				onSubmit={form.handleSubmit((values) =>
					// the saved values become the new starting point, so Save turns off again
					save.mutate(values, { onSuccess: () => form.reset(values) })
				)}
				noValidate
				className="flex flex-col gap-4"
			>
				<CardContent className="flex flex-col gap-5">
					<Controller
						control={form.control}
						name="reminderEnabled"
						render={({ field }) => (
							<Field orientation="horizontal">
								<FieldContent>
									<FieldLabel htmlFor={switchId}>
										Email me a reminder
									</FieldLabel>
								</FieldContent>
								<Switch
									id={switchId}
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</Field>
						)}
					/>
					<Controller
						control={form.control}
						name="reminderTime"
						render={({ field, fieldState }) => (
							<Field data-disabled={!enabled} data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={timeId}>Time</FieldLabel>
								<Input
									{...field}
									id={timeId}
									type="time"
									disabled={!enabled}
									aria-invalid={fieldState.invalid}
									className="h-10 max-w-40"
								/>
								{timezone && (
									<FieldDescription>
										In your time zone, {timezone}.
									</FieldDescription>
								)}
								<FieldError errors={[fieldState.error]} />
							</Field>
						)}
					/>
					<FormError message={apiErrorMessage(save.error)} />
				</CardContent>
				<CardFooter className="justify-end gap-3">
					{save.isSuccess && !isDirty && (
						<span className="flex items-center gap-1.5 text-sm text-muted-foreground">
							<CheckIcon className="size-4" />
							Saved
						</span>
					)}
					<Button
						type="submit"
						disabled={!isDirty || save.isPending}
						className="h-10 rounded-full px-4"
					>
						{save.isPending && <Spinner />}
						Save
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
