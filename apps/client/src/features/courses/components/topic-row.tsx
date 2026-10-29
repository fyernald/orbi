import type { CourseColor, Topic } from '@orbi/shared';
import { FileText } from 'lucide-react';
import { toneClasses } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { noteCountLabel } from '../note-count';
import { TopicActions } from './topic-actions';

type TopicRowProps = {
	topic: Topic;
	number: number;
	color: CourseColor;
};

export function TopicRow({ topic, number, color }: TopicRowProps) {
	return (
		<li className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40">
			<span
				aria-hidden="true"
				className={cn(
					'flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold tabular-nums',
					toneClasses[color]
				)}
			>
				{number}
			</span>
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<p className="truncate font-medium">{topic.name}</p>
				<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<FileText className="size-3.5" />
					{noteCountLabel(topic.noteCount)}
				</p>
			</div>
			<TopicActions topic={topic} />
		</li>
	);
}
