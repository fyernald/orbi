import { TUTOR_ACTIONS, type Course, type TutorAction } from '@orbi/shared';
import { formatTimeAgo } from '@/lib/dates';
import { goals } from '../goals';
import { CourseDetail } from './course-detail';
import { ExamCountdown } from './exam-countdown';
import { PaneHeader } from './pane-header';
import { StudyToolButton } from './study-tool-button';

type StudyPaneProps = {
	course: Course;
	onStartTool: (action: TutorAction) => void;
	className?: string;
};

export function StudyPane({ course, onStartTool, className }: StudyPaneProps) {
	const goal = goals[course.goal];

	return (
		<section aria-labelledby="study-pane-title" className={className}>
			<PaneHeader title={<h2 id="study-pane-title">Study</h2>} />
			<div className="flex-1 overflow-y-auto">
				<div className="flex flex-col gap-1 p-2">
					{TUTOR_ACTIONS.map((action) => (
						<StudyToolButton
							key={action}
							action={action}
							onClick={() => onStartTool(action)}
						/>
					))}
				</div>

				<div className="border-t border-divider p-4">
					<ExamCountdown examDate={course.examDate} />
				</div>

				<dl className="flex flex-col gap-2.5 border-t border-divider p-4 text-sm">
					<CourseDetail label="Goal">
						<span className="flex items-center gap-1.5">
							<goal.icon className="size-3.5 text-muted-foreground" />
							{goal.shortLabel}
						</span>
					</CourseDetail>
					<CourseDetail label="Topics">{course.topicCount}</CourseDetail>
					<CourseDetail label="Notes">{course.noteCount}</CourseDetail>
					<CourseDetail label="Last activity">
						{formatTimeAgo(course.lastActivityAt, new Date())}
					</CourseDetail>
				</dl>
			</div>
		</section>
	);
}
