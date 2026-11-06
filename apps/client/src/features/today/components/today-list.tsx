import type { TodayPlan } from '@orbi/shared';
import { upcomingLine } from '../today';
import { TodayTopicRow } from './today-topic-row';
import { UpNextTopic } from './up-next-topic';

// the weakest topic first and raised; the others below it, then what comes next
export function TodayList({ plan }: { plan: TodayPlan }) {
	const [first, ...rest] = plan.topics;
	const coming = upcomingLine(plan);
	if (!first) return null;

	return (
		<div className="flex flex-col gap-2">
			<UpNextTopic topic={first} />
			{rest.length > 0 && (
				<ul aria-label="More topics for today" className="flex flex-col">
					{rest.map((topic) => (
						<li key={topic.topicId}>
							<TodayTopicRow topic={topic} />
						</li>
					))}
				</ul>
			)}
			{coming && (
				<p className="px-3 text-sm text-muted-foreground">
					Coming up: {coming}
				</p>
			)}
		</div>
	);
}
