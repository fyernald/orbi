'use client';

import type { ReviewTopic } from '@orbi/shared';
import { CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { FormError } from '@/components/form/form-error';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { CourseBadge } from '@/features/courses/components/course-badge';
import { apiErrorMessage } from '@/lib/api';
import { courseRoute } from '@/lib/routes';
import { useApproveTopic } from '../hooks';
import { pendingIn } from '../review-cache';
import { ReviewQuestionCard } from './review-question-card';

// the questions of one topic, with a button to approve all that still wait
export function ReviewTopicGroup({ group }: { group: ReviewTopic }) {
	const approveAll = useApproveTopic(group.courseId, group.topicId);
	const heading = useRef<HTMLHeadingElement>(null);
	const waiting = pendingIn(group.questions);
	const headingId = `review-topic-${group.topicId}`;

	return (
		<section aria-labelledby={headingId} className="flex flex-col gap-3">
			<header className="flex flex-wrap items-center gap-x-3 gap-y-2">
				<CourseBadge
					course={{ name: group.courseName, color: group.courseColor }}
				/>
				<div className="flex min-w-0 flex-1 flex-col">
					<h2
						ref={heading}
						id={headingId}
						tabIndex={-1}
						className="truncate font-semibold outline-none"
					>
						{group.topicName}
					</h2>
					<p className="truncate text-sm text-muted-foreground">
						<Link
							href={courseRoute(group.courseId)}
							className="underline-offset-4 hover:text-foreground hover:underline"
						>
							{group.courseName}
						</Link>{' '}
						· {waiting === 0 ? 'All reviewed' : `${waiting} waiting`}
					</p>
				</div>
				{waiting > 1 && (
					<Button
						variant="outline"
						onClick={() =>
							// the button goes away, so the focus goes to the topic's name
							approveAll.mutate(undefined, {
								onSuccess: () => heading.current?.focus(),
							})
						}
						disabled={approveAll.isPending}
						className="h-9 rounded-full px-4"
					>
						{approveAll.isPending ? <Spinner /> : <CheckCheck />}
						Approve all {waiting}
					</Button>
				)}
			</header>
			<FormError
				message={
					approveAll.error ? apiErrorMessage(approveAll.error) : undefined
				}
			/>
			<ol className="flex flex-col gap-3">
				{group.questions.map((question, index) => (
					<li key={question.id}>
						<ReviewQuestionCard question={question} number={index + 1} />
					</li>
				))}
			</ol>
		</section>
	);
}
