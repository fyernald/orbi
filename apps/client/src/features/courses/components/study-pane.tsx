import type { ReactNode } from 'react';
import {
	TUTOR_ACTIONS,
	type QuestionSet,
	type TutorAction,
} from '@orbi/shared';
import { QuestionSetList } from '@/features/questions/components/question-set-list';
import { PaneHeader } from './pane-header';
import { StudyToolButton } from './study-tool-button';

type StudyPaneProps = {
	courseId: string;
	onStartTool: (action: TutorAction) => void;
	onOpenSet: (set: QuestionSet) => void;
	className?: string;
	studyPlan?: ReactNode;
};

export function StudyPane({
	courseId,
	onStartTool,
	onOpenSet,
	className,
	studyPlan,
}: StudyPaneProps) {
	return (
		<section aria-labelledby="study-pane-title" className={className}>
			<PaneHeader title={<h2 id="study-pane-title">Study</h2>} />
			<div className="flex flex-1 flex-col gap-7 overflow-y-auto p-3">
				{studyPlan}
				<ul className="grid grid-cols-2 gap-2">
					{TUTOR_ACTIONS.map((action) => (
						<li key={action}>
							<StudyToolButton
								action={action}
								onClick={() => onStartTool(action)}
							/>
						</li>
					))}
				</ul>

				<section
					aria-labelledby="made-title"
					className="flex flex-col gap-2 px-1"
				>
					<h3
						id="made-title"
						className="text-[13px] font-medium text-muted-foreground"
					>
						Made for this course
					</h3>
					<QuestionSetList courseId={courseId} onOpen={onOpenSet} />
				</section>
			</div>
		</section>
	);
}
