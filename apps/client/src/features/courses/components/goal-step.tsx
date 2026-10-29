'use client';

import type { CreateCourseInput } from '@orbi/shared';
import { useWatch, type Control } from 'react-hook-form';
import { ExamDateField } from './exam-date-field';
import { GoalField } from './goal-field';

export function GoalStep({ control }: { control: Control<CreateCourseInput> }) {
	const goal = useWatch({ control, name: 'goal' });

	return (
		<>
			<GoalField control={control} />
			{goal === 'exam_prep' && <ExamDateField control={control} />}
		</>
	);
}
