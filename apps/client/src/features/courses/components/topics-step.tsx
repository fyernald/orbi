'use client';

import type { CreateCourseInput } from '@orbi/shared';
import { useController, type Control } from 'react-hook-form';
import { TopicChipsInput } from './topic-chips-input';

export function TopicsStep({
	control,
}: {
	control: Control<CreateCourseInput>;
}) {
	const { field, fieldState } = useController({ control, name: 'topics' });

	return (
		<TopicChipsInput
			value={field.value}
			onChange={field.onChange}
			inputRef={field.ref}
			error={fieldState.error?.message}
		/>
	);
}
