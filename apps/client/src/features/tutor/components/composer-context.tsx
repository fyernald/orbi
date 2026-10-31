'use client';

import type { TutorRequestInput } from '@orbi/shared';
import { useController, type Control } from 'react-hook-form';
import { composerActionList, composerActions } from '../actions';
import type { Topic } from '../mock-data';
import { ActionPicker } from './action-picker';
import { TopicPicker } from './topic-picker';

type ComposerContextProps = {
	control: Control<TutorRequestInput>;
	topics: Topic[];
	// the course's name, when the whole course is a choice
	wholeCourse?: string;
	// set when picking a topic does more than fill the field (it opens that topic's chat)
	onTopicChange?: (topicId: string) => void;
};

// the action and topic fields, read as a sentence: "Ask Orbi about Biology 101 › Meiosis"
export function ComposerContext({
	control,
	topics,
	wholeCourse,
	onTopicChange,
}: ComposerContextProps) {
	const { field: actionField } = useController({ control, name: 'action' });
	const { field: topicField } = useController({ control, name: 'topicId' });
	const action = composerActions[actionField.value];

	return (
		<div className="flex min-w-0 flex-wrap items-center gap-2">
			<ActionPicker
				actions={composerActionList}
				selected={action}
				onSelect={actionField.onChange}
			/>
			<span className="text-[13px] text-muted-foreground">{action.joiner}</span>
			<TopicPicker
				topics={topics}
				selected={topics.find(({ id }) => id === topicField.value)}
				onSelect={onTopicChange ?? topicField.onChange}
				wholeCourse={wholeCourse}
			/>
		</div>
	);
}
