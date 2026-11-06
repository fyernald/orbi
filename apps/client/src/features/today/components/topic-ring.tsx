import type { TodayTopic } from '@orbi/shared';
import { OrbitRing } from '@/components/orbit-ring';
import { toneTextClasses } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { topicTotal } from '../today';

type TopicRingProps = {
	topic: TodayTopic;
	className?: string;
	countClassName?: string;
};

// the ring is the topic's mastery in its course's colour, dashed before the first
// answer; the number is how many questions it has today
export function TopicRing({
	topic,
	className,
	countClassName,
}: TopicRingProps) {
	return (
		<OrbitRing
			value={topic.mastery}
			className={cn(toneTextClasses[topic.courseColor], className)}
		>
			<span
				className={cn(
					'font-semibold text-foreground tabular-nums',
					countClassName
				)}
			>
				{topicTotal(topic)}
			</span>
		</OrbitRing>
	);
}
