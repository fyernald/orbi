import type { TodayTopic } from '@orbi/shared';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { CourseBadge } from '@/features/courses/components/course-badge';
import { topicStudyRoute } from '@/lib/routes';
import { topicCounts } from '../today';
import { MasteryBar } from './mastery-bar';

// a topic after the first one: its course badge, what is due, and its mastery;
// the whole row starts it
export function TodayTopicRow({ topic }: { topic: TodayTopic }) {
	return (
		<Link
			href={topicStudyRoute(topic.courseId, topic.topicId, { today: true })}
			className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
		>
			<CourseBadge
				course={{ name: topic.courseName, color: topic.courseColor }}
			/>
			<span className="flex min-w-0 flex-1 flex-col">
				<span className="truncate text-sm font-medium">{topic.topicName}</span>
				<span className="truncate text-xs text-muted-foreground">
					{/* the counts first, so a narrow row cuts the course name, which the
					badge already shows */}
					{topicCounts(topic)} · {topic.courseName}
				</span>
			</span>
			<MasteryBar mastery={topic.mastery} color={topic.courseColor} />
			<ChevronRight
				aria-hidden="true"
				className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
			/>
		</Link>
	);
}
