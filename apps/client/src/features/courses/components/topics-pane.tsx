'use client';

import type { Course, Topic } from '@orbi/shared';
import { Layers, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { COURSE_SCOPE } from '@/features/tutor/chat';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { AddTopicInline } from './add-topic-inline';
import { CourseActions } from './course-actions';
import { CourseIntro } from './course-intro';
import { LoadError } from '@/components/load-error';
import { PaneHeader } from './pane-header';
import { ReplyingDot } from './replying-dot';
import { TopicListItem } from './topic-list-item';
import { TopicRowsLoading } from './topic-rows-loading';

type TopicsPaneProps = {
	course: Course;
	// undefined while loading, or when loading failed (loadError)
	topics: Topic[] | undefined;
	loadError: string | undefined;
	onRetry: () => void;
	// null means the whole course
	selectedTopicId: string | null;
	onSelect: (topicId: string | null) => void;
	onOpenNotes: (topicId: string) => void;
	// goes up each time another pane asks to add a topic; it opens the new topic field
	addTopicRequest: number;
	// the chats with a reply running: topic ids, or the whole-course scope
	busyScopes: ReadonlySet<string>;
	className?: string;
};

export function TopicsPane({
	course,
	topics,
	loadError,
	onRetry,
	selectedTopicId,
	onSelect,
	onOpenNotes,
	addTopicRequest,
	busyScopes,
	className,
}: TopicsPaneProps) {
	const router = useRouter();
	const [query, setQuery] = useState('');
	const [adding, setAdding] = useState(false);
	const [seenRequest, setSeenRequest] = useState(addTopicRequest);
	if (seenRequest !== addTopicRequest) {
		setSeenRequest(addTopicRequest);
		setAdding(true);
	}
	const shown = topics?.filter((topic) =>
		topic.name.toLowerCase().includes(query.trim().toLowerCase())
	);

	return (
		<section aria-labelledby="course-title" className={className}>
			<PaneHeader
				title={
					<h1 id="course-title" className="truncate text-base font-semibold">
						{course.name}
					</h1>
				}
				actions={
					<CourseActions
						course={course}
						onDeleted={() => router.replace(routes.courses)}
					/>
				}
			/>

			<div className="flex-1 overflow-y-auto">
				<CourseIntro course={course} />

				<div className="flex items-center justify-between px-4 pt-4">
					<h2
						id="topics-title"
						className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground"
					>
						Topics
						{topics && <span className="tabular-nums">{topics.length}</span>}
					</h2>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() => setAdding(true)}
						aria-label="Add topic"
						className="rounded-md text-muted-foreground"
					>
						<Plus />
					</Button>
				</div>

				{topics && topics.length > 6 && (
					<div className="relative px-3 pt-2">
						<Search className="pointer-events-none absolute top-1/2 left-5.5 mt-1 size-3.5 -translate-y-1/2 text-muted-foreground" />
						<input
							type="search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Find a topic"
							aria-label="Find a topic"
							className="h-8 w-full rounded-md border border-input bg-transparent pr-2 pl-7 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
						/>
					</div>
				)}

				<div className="p-2">
					{!topics && !loadError && <TopicRowsLoading />}
					{loadError && (
						<div className="p-2">
							<LoadError message={loadError} onRetry={onRetry} />
						</div>
					)}
					{shown && (
						<ul
							aria-labelledby="topics-title"
							className="flex flex-col gap-0.5"
						>
							<li>
								<button
									type="button"
									onClick={() => onSelect(null)}
									aria-pressed={selectedTopicId === null}
									className={cn(
										'flex h-11 w-full items-center gap-3 rounded-lg px-2 text-left text-sm transition-colors',
										selectedTopicId === null
											? 'bg-muted font-semibold'
											: 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
									)}
								>
									<span className="flex size-7 shrink-0 items-center justify-center">
										<Layers className="size-4" />
									</span>
									<span className="flex-1">Whole course</span>
									{busyScopes.has(COURSE_SCOPE) && <ReplyingDot />}
								</button>
							</li>
							{shown.map((topic) => (
								<TopicListItem
									key={topic.id}
									topic={topic}
									color={course.color}
									selected={topic.id === selectedTopicId}
									onSelect={() => onSelect(topic.id)}
									onOpenNotes={() => onOpenNotes(topic.id)}
									replying={busyScopes.has(topic.id)}
								/>
							))}
						</ul>
					)}
					{topics?.length === 0 && !adding && (
						<p className="px-2 py-6 text-center text-sm text-muted-foreground">
							No topics yet. Add one for each chapter or lecture.
						</p>
					)}
					{shown && shown.length === 0 && topics!.length > 0 && (
						<p className="px-2 py-6 text-center text-sm text-muted-foreground">
							No topic matches “{query}”.
						</p>
					)}
				</div>
			</div>

			<div className="shrink-0 border-t border-divider p-2">
				{adding ? (
					<AddTopicInline
						courseId={course.id}
						focusRequest={addTopicRequest}
						onClose={() => setAdding(false)}
					/>
				) : (
					<Button
						variant="ghost"
						onClick={() => setAdding(true)}
						className="h-9 w-full justify-start rounded-md px-2 text-muted-foreground"
					>
						<Plus />
						Add topic
					</Button>
				)}
			</div>
		</section>
	);
}
