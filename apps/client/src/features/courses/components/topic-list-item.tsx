import type { CourseColor, Topic } from '@orbi/shared';
import { toneClasses } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { TopicActions } from './topic-actions';

type TopicListItemProps = {
	topic: Topic;
	number: number;
	color: CourseColor;
	selected: boolean;
	onSelect: () => void;
};

export function TopicListItem({
	topic,
	number,
	color,
	selected,
	onSelect,
}: TopicListItemProps) {
	return (
		<li
			className={cn(
				'group flex items-center rounded-md transition-colors',
				selected ? 'bg-muted' : 'hover:bg-muted/60'
			)}
		>
			<button
				type="button"
				onClick={onSelect}
				aria-pressed={selected}
				className="flex min-w-0 flex-1 items-center gap-2.5 py-2 pl-2 text-left text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
			>
				<span
					aria-hidden="true"
					className={cn(
						'flex size-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold tabular-nums',
						toneClasses[color]
					)}
				>
					{number}
				</span>
				<span className="flex min-w-0 flex-col">
					<span className={cn('truncate', selected && 'font-medium')}>
						{topic.name}
					</span>
					<span className="text-xs text-muted-foreground">
						{topic.noteCount === 0
							? 'No notes'
							: `${topic.noteCount} ${topic.noteCount === 1 ? 'note' : 'notes'}`}
					</span>
				</span>
			</button>
			<TopicActions topic={topic} />
		</li>
	);
}
