import type { TodayPlan } from '@orbi/shared';
import { TodayTopicRow } from './today-topic-row';
import { UpNextTopic } from './up-next-topic';

// the weakest topic first and raised; the others below it
export function TodayList({ plan }: { plan: TodayPlan }) {
	const [first, ...rest] = plan.topics;
	if (!first) return null;

	return (
		<div className="flex flex-col gap-2">
			<UpNextTopic topic={first} />
			{rest.length > 0 && (
				<ul aria-label="More topics for today" className="-mx-2 flex flex-col">
					{rest.map((topic) => (
						<li key={topic.topicId}>
							<TodayTopicRow topic={topic} />
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
