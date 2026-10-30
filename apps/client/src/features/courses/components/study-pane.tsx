import { TUTOR_ACTIONS, type TutorAction } from '@orbi/shared';
import { PaneHeader } from './pane-header';
import { StudyToolButton } from './study-tool-button';

type StudyPaneProps = {
	onStartTool: (action: TutorAction) => void;
	className?: string;
};

export function StudyPane({ onStartTool, className }: StudyPaneProps) {
	return (
		<section aria-labelledby="study-pane-title" className={className}>
			<PaneHeader title={<h2 id="study-pane-title">Study</h2>} />
			<div className="flex flex-1 flex-col gap-7 overflow-y-auto p-3">
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

				{/* lists what was generated once the AI work lands in Sprint 2 */}
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
					<p className="text-sm text-muted-foreground">
						Questions, flashcards, and mock exams you make show up here.
					</p>
				</section>
			</div>
		</section>
	);
}
