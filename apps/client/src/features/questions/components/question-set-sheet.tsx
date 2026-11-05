'use client';

import type { QuestionSet } from '@orbi/shared';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import { formatTimeAgo } from '@/lib/dates';
import { questionCountLabel } from '../question-count';
import { useTopicQuestions } from '../topic-hooks';
import { QuestionCard } from './question-card';
import { TopicQuestionsList } from './topic-questions-list';

type QuestionSetSheetProps = {
	courseId: string;
	// kept while the sheet closes, so its content does not vanish mid-animation
	set: QuestionSet | undefined;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

// The questions of one set. They come from the topic's list, so an edit, a delete,
// or a report here shows in the topic's questions too
export function QuestionSetSheet({
	courseId,
	set,
	open,
	onOpenChange,
}: QuestionSetSheetProps) {
	return (
		<Sheet open={open && set !== undefined} onOpenChange={onOpenChange}>
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
				{set && <SetQuestions key={set.id} courseId={courseId} set={set} />}
			</SheetContent>
		</Sheet>
	);
}

function SetQuestions({
	courseId,
	set,
}: {
	courseId: string;
	set: QuestionSet;
}) {
	const topicQuestions = useTopicQuestions(courseId, set.topicId);
	// the topic lists each set in the order it was made
	const questions = topicQuestions.data?.filter(
		(question) => question.setId === set.id
	);

	return (
		<>
			<SheetHeader className="border-b border-divider pr-12">
				<SheetTitle className="truncate">{set.topicName}</SheetTitle>
				<SheetDescription>
					{questionCountLabel(questions?.length ?? set.questionCount)} · made{' '}
					{formatTimeAgo(set.createdAt, new Date())}
				</SheetDescription>
			</SheetHeader>
			<div className="flex flex-1 flex-col overflow-y-auto p-4">
				{questions ? (
					questions.length === 0 ? (
						<p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
							Every question of this set was deleted or reported.
						</p>
					) : (
						<ul aria-label="Questions" className="flex flex-col gap-2">
							{questions.map((question) => (
								<li key={question.id}>
									<QuestionCard courseId={courseId} question={question} />
								</li>
							))}
						</ul>
					)
				) : (
					// loading and load errors look the same as in the topic's questions
					<TopicQuestionsList courseId={courseId} questions={topicQuestions} />
				)}
			</div>
		</>
	);
}
