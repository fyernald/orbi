import { CircleHelp, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { courseRoute, routes } from '@/lib/routes';

type SessionEmptyProps = {
	courseId: string;
	topicName: string;
	pendingCount: number;
};

// says what to do first: approve the questions that wait, or have the tutor write some
export function SessionEmpty({
	courseId,
	topicName,
	pendingCount,
}: SessionEmptyProps) {
	const waiting = pendingCount > 0;
	const Icon = waiting ? ListChecks : CircleHelp;

	return (
		<div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
			<span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
				<Icon className="size-6" />
			</span>
			<h2 className="text-lg font-semibold">
				{waiting ? 'Approve your questions first' : 'No questions to study yet'}
			</h2>
			<p className="max-w-sm text-pretty text-muted-foreground">
				{waiting
					? `${pendingCount} ${pendingCount === 1 ? 'question' : 'questions'} for ${topicName} ${pendingCount === 1 ? 'is' : 'are'} waiting for your review. The ones you approve show up here.`
					: `Ask the tutor to write practice questions from your ${topicName} notes, then approve the ones you want to study.`}
			</p>
			<div className="mt-2 flex flex-wrap justify-center gap-2">
				{waiting ? (
					<Button asChild className="h-9 rounded-full px-4">
						<Link href={routes.review}>Review questions</Link>
					</Button>
				) : (
					<Button asChild className="h-9 rounded-full px-4">
						<Link href={courseRoute(courseId, { tool: 'questions' })}>
							Make questions
						</Link>
					</Button>
				)}
				<Button asChild variant="outline" className="h-9 rounded-full px-4">
					<Link href={courseRoute(courseId)}>Back to the course</Link>
				</Button>
			</div>
		</div>
	);
}
