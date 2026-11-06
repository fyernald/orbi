import type { TodayTopic } from '@orbi/shared';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { topicStudyRoute } from '@/lib/routes';
import { masteryLabel, topicCounts } from '../today';
import { TopicRing } from './topic-ring';

// the weakest topic, raised above the others so there is one clear first step
export function UpNextTopic({ topic }: { topic: TodayTopic }) {
	const titleId = `up-next-${topic.topicId}`;

	return (
		<article
			aria-labelledby={titleId}
			className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5"
		>
			<TopicRing topic={topic} className="size-14" countClassName="text-lg" />
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
					Up next
				</p>
				<h3 id={titleId} className="truncate text-base font-semibold">
					{topic.topicName}
				</h3>
				{/* wraps on a phone, so the counts are never cut off */}
				<p className="text-sm text-pretty text-muted-foreground">
					{topic.courseName} · {masteryLabel(topic.mastery)} ·{' '}
					{topicCounts(topic)}
				</p>
			</div>
			<Button asChild className="h-9 rounded-full px-4">
				<Link
					href={topicStudyRoute(topic.courseId, topic.topicId, {
						today: true,
					})}
					aria-label={`Start ${topic.topicName}`}
				>
					Start
					<ArrowRight />
				</Link>
			</Button>
		</article>
	);
}
