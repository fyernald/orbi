import type { TodayTopic } from '@orbi/shared';
import Link from 'next/link';
import { topicStudyRoute } from '@/lib/routes';
import { masteryLabel, topicCounts } from '../today';
import { TopicRing } from './topic-ring';

// a topic after the first one: quieter, and the whole row starts it
export function TodayTopicRow({ topic }: { topic: TodayTopic }) {
	return (
		<Link
			href={topicStudyRoute(topic.courseId, topic.topicId, { today: true })}
			className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
		>
			<TopicRing topic={topic} className="size-9" countClassName="text-xs" />
			<span className="flex min-w-0 flex-1 flex-col">
				<span className="truncate text-sm font-medium">{topic.topicName}</span>
				<span className="truncate text-xs text-muted-foreground">
					{topic.courseName} · {topicCounts(topic)}
					<span className="sr-only"> · {masteryLabel(topic.mastery)}</span>
				</span>
			</span>
			<span className="text-sm font-medium text-subtle-foreground transition-colors group-hover:text-foreground">
				Start
			</span>
		</Link>
	);
}
