import type { TodayPlan } from '@orbi/shared';
import { Check, Moon } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { courseRoute, topicStudyRoute } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { answeredLine, upcomingLine, type TodayState } from '../today';

type TodayDoneProps = {
	plan: TodayPlan;
	state: Exclude<TodayState, 'list'>;
};

function Idea({
	children,
	courseName,
	action,
	href,
}: {
	children: ReactNode;
	courseName: string;
	action: string;
	href: string;
}) {
	return (
		<li className="flex items-center gap-3 py-3 last:pb-0">
			<p className="min-w-0 flex-1 text-sm">
				{children} <span className="text-muted-foreground">{courseName}</span>
			</p>
			<Button asChild variant="outline" className="h-8 rounded-full px-3">
				<Link href={href}>{action}</Link>
			</Button>
		</li>
	);
}

// the list is empty: what was done today, what comes next, and what is worth
// doing anyway (weak topics, and topics with no questions yet)
export function TodayDone({ plan, state }: TodayDoneProps) {
	const done = state === 'done';
	const coming = upcomingLine(plan);
	const summary = [done && answeredLine(plan), coming && `Next: ${coming}`]
		.filter(Boolean)
		.join(' · ');
	const Icon = done ? Check : Moon;
	const hasIdeas = plan.weakTopics.length + plan.emptyTopics.length > 0;

	return (
		<div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 sm:p-5">
			<div className="flex items-center gap-3 pb-3">
				<span
					className={cn(
						'flex size-10 shrink-0 items-center justify-center rounded-xl',
						done
							? 'bg-tone-green text-tone-green-foreground'
							: 'bg-muted text-subtle-foreground'
					)}
				>
					<Icon className="size-5" />
				</span>
				<div className="flex min-w-0 flex-col">
					<h3 className="font-semibold">
						{done ? 'Done for today' : 'Nothing due today'}
					</h3>
					{summary && (
						<p className="text-sm text-muted-foreground">{summary}</p>
					)}
				</div>
			</div>
			{hasIdeas && (
				<ul
					aria-label="Worth doing anyway"
					className="flex flex-col divide-y divide-divider border-t border-divider"
				>
					{plan.weakTopics.map((topic) => (
						<Idea
							key={topic.topicId}
							courseName={topic.courseName}
							action="Practice"
							href={topicStudyRoute(topic.courseId, topic.topicId)}
						>
							<span className="font-medium">{topic.topicName}</span> is at{' '}
							{topic.mastery}.
						</Idea>
					))}
					{plan.emptyTopics.map((topic) => (
						<Idea
							key={topic.topicId}
							courseName={topic.courseName}
							action="Make questions"
							href={courseRoute(topic.courseId, {
								tool: 'questions',
								topic: topic.topicId,
							})}
						>
							<span className="font-medium">{topic.topicName}</span> has no
							questions yet.
						</Idea>
					))}
				</ul>
			)}
		</div>
	);
}
