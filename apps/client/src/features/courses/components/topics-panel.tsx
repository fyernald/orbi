'use client';

import type { Course } from '@orbi/shared';
import { Layers, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { apiErrorMessage } from '@/lib/api';
import { useTopics } from '../hooks';
import { AddTopicRow } from './add-topic-row';
import { LoadError } from './load-error';
import { TopicRow } from './topic-row';
import { TopicRowsLoading } from './topic-rows-loading';

export function TopicsPanel({ course }: { course: Course }) {
	const topics = useTopics(course.id);
	const [adding, setAdding] = useState(false);
	const empty = topics.data?.length === 0;

	return (
		<section
			aria-labelledby="topics-heading"
			className="overflow-hidden rounded-3xl border border-border bg-card shadow-xs"
		>
			<div className="flex items-center justify-between gap-3 border-b border-divider px-5 py-4">
				<div className="flex items-center gap-2">
					<h2 id="topics-heading" className="font-medium">
						Topics
					</h2>
					{topics.data && (
						<span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
							{topics.data.length}
						</span>
					)}
				</div>
				{!adding && !empty && (
					<Button
						variant="outline"
						onClick={() => setAdding(true)}
						className="h-9 rounded-full px-3.5"
					>
						<Plus />
						Add topic
					</Button>
				)}
			</div>

			{topics.isPending && <TopicRowsLoading />}
			{topics.isError && (
				<div className="p-5">
					<LoadError
						message={apiErrorMessage(topics.error)}
						onRetry={() => topics.refetch()}
					/>
				</div>
			)}
			{empty && !adding && (
				<div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
					<span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
						<Layers className="size-6" />
					</span>
					<div className="flex flex-col gap-1">
						<p className="font-medium">No topics yet</p>
						<p className="max-w-xs text-sm text-muted-foreground">
							Add one for each chapter or lecture, for example Cell division.
						</p>
					</div>
					<Button
						onClick={() => setAdding(true)}
						className="mt-1 h-10 rounded-full px-5"
					>
						<Plus />
						Add the first topic
					</Button>
				</div>
			)}
			{topics.data && topics.data.length > 0 && (
				<ol className="divide-y divide-divider">
					{topics.data.map((topic, index) => (
						<TopicRow
							key={topic.id}
							topic={topic}
							number={index + 1}
							color={course.color}
						/>
					))}
				</ol>
			)}
			{adding && (
				<AddTopicRow courseId={course.id} onClose={() => setAdding(false)} />
			)}
		</section>
	);
}
