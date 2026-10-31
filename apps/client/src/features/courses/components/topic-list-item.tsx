import type { CourseColor, Topic } from '@orbi/shared';
import { cn } from '@/lib/utils';
import { noteCountLabel } from '../note-count';
import { MasteryRing } from './mastery-ring';
import { TopicActions } from './topic-actions';

type TopicListItemProps = {
	topic: Topic;
	color: CourseColor;
	selected: boolean;
	onSelect: () => void;
	onOpenNotes: () => void;
};

export function TopicListItem({
	topic,
	color,
	selected,
	onSelect,
	onOpenNotes,
}: TopicListItemProps) {
	return (
		<li
			className={cn(
				'group flex items-center rounded-lg transition-colors',
				selected ? 'bg-muted' : 'hover:bg-muted/60'
			)}
		>
			<button
				type="button"
				onClick={onSelect}
				aria-pressed={selected}
				className="flex min-w-0 flex-1 items-center gap-3 py-2 pl-2 text-left text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
			>
				{/* the topic's mastery score comes with the review scheduler in Sprint 3 */}
				<MasteryRing value={null} color={color} className="size-7" />
				<span className="flex min-w-0 flex-col">
					<span className={cn('truncate', selected && 'font-semibold')}>
						{topic.name}
					</span>
					<span className="text-xs text-muted-foreground">
						{noteCountLabel(topic.noteCount)}
					</span>
				</span>
			</button>
			<TopicActions topic={topic} onOpenNotes={onOpenNotes} />
		</li>
	);
}
