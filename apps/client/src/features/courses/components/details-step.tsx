import type { CreateCourseInput } from '@orbi/shared';
import type { Control } from 'react-hook-form';
import { TextareaField } from '@/components/form/textarea-field';
import { TextField } from '@/components/form/text-field';
import { ColorField } from './color-field';

export function DetailsStep({
	control,
}: {
	control: Control<CreateCourseInput>;
}) {
	return (
		<>
			<TextField
				control={control}
				name="name"
				label="Course name"
				placeholder="e.g. Biology 101"
				autoComplete="off"
				autoFocus
				className="h-10 rounded-xl"
			/>
			<TextareaField
				control={control}
				name="description"
				label="Description (optional)"
				placeholder="What the course covers, for example cells, genetics, and evolution"
				description="Orbi reads it to understand the course when it writes questions."
				rows={3}
				className="rounded-xl"
			/>
			<ColorField control={control} />
		</>
	);
}
