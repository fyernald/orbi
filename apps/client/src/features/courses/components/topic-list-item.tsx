import type { CourseColor, Topic, TopicMastery } from '@orbi/shared';
import { cn } from '@/lib/utils';
import { masteryLabel } from '../mastery';
import { noteCountLabel } from '../note-count';
import { MasteryRing } from './mastery-ring';
import { ReplyingDot } from './replying-dot';
import { TopicActions } from './topic-actions';

type TopicListItemProps = {
	topic: Topic;
	color: CourseColor;
	// undefined while the scores load
	score: TopicMastery['score'] | undefined;
	selected: boolean;
	onSelect: () => void;
	onOpenNotes: () => void;
	onOpenQuestions: () => void;
	// Orbi is still answering in this topic's chat
	replying: boolean;
};

export function TopicListItem({
	topic,
	color,
	score,
	selected,
	onSelect,
	onOpenNotes,
	onOpenQuestions,
	replying,
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
				<MasteryRing
					value={score ?? null}
					color={color}
					showValue={false}
					className="size-7"
				/>
				<span className="flex min-w-0 flex-1 flex-col">
					<span className={cn('truncate', selected && 'font-semibold')}>
						{topic.name}
					</span>
					<span className="truncate text-xs text-muted-foreground">
						{noteCountLabel(topic.noteCount)}
						{score !== undefined && ` · ${masteryLabel(score)}`}
					</span>
				</span>
				{replying && <ReplyingDot />}
			</button>
			<TopicActions
				topic={topic}
				onOpenNotes={onOpenNotes}
				onOpenQuestions={onOpenQuestions}
			/>
		</li>
	);
}
