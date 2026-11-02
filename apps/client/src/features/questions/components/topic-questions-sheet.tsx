'use client';

import type { Topic } from '@orbi/shared';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import { questionCountLabel } from '../question-count';
import { useTopicQuestions } from '../topic-hooks';
import { AddQuestionForm } from './add-question-form';
import { TopicQuestionsList } from './topic-questions-list';

type TopicQuestionsSheetProps = {
	courseId: string;
	// kept while the sheet closes, so its content does not vanish mid-animation
	topic: Topic | undefined;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

// the topic's questions: write one on top, the saved ones below
export function TopicQuestionsSheet({
	courseId,
	topic,
	open,
	onOpenChange,
}: TopicQuestionsSheetProps) {
	return (
		<Sheet open={open && topic !== undefined} onOpenChange={onOpenChange}>
			<SheetContent
				// Esc in an editor stops writing; the sheet stays open
				onEscapeKeyDown={(event) => {
					if (
						event.target instanceof Element &&
						event.target.closest('[data-question-editor]')
					) {
						event.preventDefault();
					}
				}}
				className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg"
			>
				{/* a new topic starts with a closed form */}
				{topic && (
					<TopicQuestions key={topic.id} courseId={courseId} topic={topic} />
				)}
			</SheetContent>
		</Sheet>
	);
}

function TopicQuestions({
	courseId,
	topic,
}: {
	courseId: string;
	topic: Topic;
}) {
	const questions = useTopicQuestions(courseId, topic.id);

	return (
		<>
			<SheetHeader className="border-b border-divider pr-12">
				<SheetTitle className="truncate">{topic.name}</SheetTitle>
				<SheetDescription>
					{questions.data
						? `${questionCountLabel(questions.data.length)} · `
						: ''}
					The ones you write are ready to study.
				</SheetDescription>
			</SheetHeader>
			<div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
				<AddQuestionForm courseId={courseId} topicId={topic.id} />
				<section
					aria-labelledby="topic-questions-title"
					className="flex flex-col gap-3"
				>
					<h3
						id="topic-questions-title"
						className="text-[13px] font-medium text-muted-foreground"
					>
						Questions
					</h3>
					<TopicQuestionsList courseId={courseId} questions={questions} />
				</section>
			</div>
		</>
	);
}
