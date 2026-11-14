import type { TodayTopic } from '@orbi/shared';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toneSurfaceClasses } from '@/lib/tones';
import { topicStudyRoute } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { masteryLabel, topicCounts } from '../today';
import { MasteryRing } from './mastery-ring';

// the weakest topic, raised and tinted in its course's colour, so there is one
// clear first step
export function UpNextTopic({ topic }: { topic: TodayTopic }) {
	const titleId = `up-next-${topic.topicId}`;

	return (
		<article
			aria-labelledby={titleId}
			className={cn(
				'flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center',
				toneSurfaceClasses[topic.courseColor]
			)}
		>
			<div className="flex min-w-0 flex-1 items-center gap-4">
				<MasteryRing mastery={topic.mastery} color={topic.courseColor} />
				<div className="flex min-w-0 flex-col gap-0.5">
					<p className="truncate text-xs font-medium tracking-wide text-subtle-foreground uppercase">
						Up next · {topic.courseName}
					</p>
					<h3 id={titleId} className="truncate text-lg font-semibold">
						{topic.topicName}
					</h3>
					<p className="text-sm text-subtle-foreground">
						{topicCounts(topic)}
						<span className="sr-only"> · {masteryLabel(topic.mastery)}</span>
					</p>
				</div>
			</div>
			<Button asChild className="h-10 rounded-full px-5">
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
