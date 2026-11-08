import type { Topic } from '@orbi/shared';
import { formatShortDate, toIsoDate } from '@/lib/dates';
import { studyPlan } from '../study-plan';
import { StudyPlanSchedule } from './study-plan-schedule';
import { StudyPlanTopic } from './study-plan-topic';

type StudyPlanBodyProps = {
	courseId: string;
	topics: Topic[];
	examDate: string;
	now: Date;
};

export function StudyPlanBody({
	courseId,
	topics,
	examDate,
	now,
}: StudyPlanBodyProps) {
	if (topics.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				Add topics to this course to build your plan.
			</p>
		);
	}

	const plan = studyPlan(topics, examDate, now);
	const today = toIsoDate(now);
	const [first, ...rest] = plan;
	const todays = first?.date === today ? first : undefined;
	const upcoming = todays ? rest : plan;
	const done = topics.filter((topic) => topic.planDoneOn !== null).length;

	return (
		<div className="flex flex-col gap-3">
			<p className="text-xs text-muted-foreground">
				{done} of {topics.length} topics done
			</p>
			{!first ? (
				<p className="text-sm text-muted-foreground">
					Every topic is done. Use the days left to revise.
				</p>
			) : (
				<section
					aria-labelledby="study-plan-today"
					className="flex flex-col gap-2"
				>
					<h4 id="study-plan-today" className="text-sm font-medium">
						Today
					</h4>
					{todays ? (
						<ul className="flex flex-col gap-2">
							{todays.topics.map((topic) => (
								<li key={topic.id}>
									<StudyPlanTopic
										courseId={courseId}
										topic={topic}
										today={today}
									/>
								</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-muted-foreground">
							Nothing new today. Next up on {formatShortDate(first.date)}.
						</p>
					)}
				</section>
			)}
			{upcoming.length > 0 && <StudyPlanSchedule days={upcoming} />}
		</div>
	);
}
