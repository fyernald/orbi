'use client';

import type { Topic } from '@orbi/shared';
import { useId } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useUpdateTopic } from '../hooks';

type StudyPlanTopicProps = {
	courseId: string;
	topic: Topic;
	today: string;
};

// one of today's topics; the tick shows at once, while it is saved
export function StudyPlanTopic({
	courseId,
	topic,
	today,
}: StudyPlanTopicProps) {
	const update = useUpdateTopic(courseId);
	const id = useId();
	const done = update.isPending
		? update.variables.planDoneOn !== null
		: topic.planDoneOn !== null;

	return (
		<div className="flex items-center gap-2">
			<Checkbox
				id={id}
				checked={done}
				disabled={update.isPending}
				onCheckedChange={(checked) =>
					update.mutate({
						topicId: topic.id,
						planDoneOn: checked === true ? today : null,
					})
				}
			/>
			<Label
				htmlFor={id}
				className={
					done
						? 'font-normal text-muted-foreground line-through'
						: 'font-normal'
				}
			>
				{topic.name}
			</Label>
		</div>
	);
}
