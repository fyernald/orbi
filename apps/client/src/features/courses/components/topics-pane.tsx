'use client';

import type { Course, Topic } from '@orbi/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { Layers, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { apiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { AddTopicInline } from './add-topic-inline';
import { LoadError } from './load-error';
import { PaneHeader } from './pane-header';
import { TopicListItem } from './topic-list-item';
import { TopicRowsLoading } from './topic-rows-loading';

type TopicsPaneProps = {
	course: Course;
	topics: UseQueryResult<Topic[]>;
	// null means the whole course
	selectedTopicId: string | null;
	onSelect: (topicId: string | null) => void;
	className?: string;
};

export function TopicsPane({
	course,
	topics,
	selectedTopicId,
	onSelect,
	className,
}: TopicsPaneProps) {
	const [query, setQuery] = useState('');
	const [adding, setAdding] = useState(false);
	const shown = topics.data?.filter((topic) =>
		topic.name.toLowerCase().includes(query.trim().toLowerCase())
	);

	return (
		<section aria-labelledby="topics-pane-title" className={className}>
			<PaneHeader
				title={
					<>
						<h2 id="topics-pane-title">Topics</h2>
						{topics.data && (
							<span className="text-xs font-normal text-muted-foreground tabular-nums">
								{topics.data.length}
							</span>
						)}
					</>
				}
				actions={
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() => setAdding(true)}
						aria-label="Add topic"
						className="rounded-md text-muted-foreground"
					>
						<Plus />
					</Button>
				}
			/>

			{topics.data && topics.data.length > 6 && (
				<div className="relative px-3 pt-3">
					<Search className="pointer-events-none absolute top-1/2 left-5.5 mt-1.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
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

			<div className="flex-1 overflow-y-auto p-2">
				{topics.isPending && <TopicRowsLoading />}
				{topics.isError && (
					<div className="p-2">
						<LoadError
							message={apiErrorMessage(topics.error)}
							onRetry={() => topics.refetch()}
						/>
					</div>
				)}
				{shown && (
					<ul className="flex flex-col gap-0.5">
						<li>
							<button
								type="button"
								onClick={() => onSelect(null)}
								aria-pressed={selectedTopicId === null}
								className={cn(
									'flex h-9 w-full items-center gap-2.5 rounded-md px-2 text-left text-sm transition-colors',
									selectedTopicId === null
										? 'bg-muted font-medium'
										: 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
								)}
							>
								<Layers className="size-4 shrink-0" />
								Whole course
							</button>
						</li>
						{shown.map((topic, index) => (
							<TopicListItem
								key={topic.id}
								topic={topic}
								number={index + 1}
								color={course.color}
								selected={topic.id === selectedTopicId}
								onSelect={() => onSelect(topic.id)}
							/>
						))}
					</ul>
				)}
				{topics.data?.length === 0 && !adding && (
					<p className="px-2 py-6 text-center text-sm text-muted-foreground">
						No topics yet. Add one for each chapter or lecture.
					</p>
				)}
				{shown && shown.length === 0 && topics.data!.length > 0 && (
					<p className="px-2 py-6 text-center text-sm text-muted-foreground">
						No topic matches “{query}”.
					</p>
				)}
			</div>

			<div className="shrink-0 border-t border-divider p-2">
				{adding ? (
					<AddTopicInline
						courseId={course.id}
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
