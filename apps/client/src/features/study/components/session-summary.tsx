'use client';

import type { StudyQuestion } from '@orbi/shared';
import { RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { OrbitRing } from '@/components/orbit-ring';
import { SlideIn } from '@/components/slide-in';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { courseRoute } from '@/lib/routes';
import type { MapItem } from '../question-map';
import { summarize, summaryHeadline, type StudyRun } from '../session';
import { MissedQuestions } from './missed-questions';
import { QuestionMap } from './question-map';
import { SessionHeader } from './session-header';
import { SessionLayout } from './session-layout';
import { SessionTitle } from './session-title';

type SessionSummaryProps = {
	courseId: string;
	courseName: string;
	topicName: string;
	questions: StudyQuestion[];
	answers: StudyRun['answers'];
	items: MapItem[];
	restarting: boolean;
	onRestart: () => void;
};

// the score on the left, the missed questions in the centre, what to do next on the right
export function SessionSummary({
	courseId,
	courseName,
	topicName,
	questions,
	answers,
	items,
	restarting,
	onRestart,
}: SessionSummaryProps) {
	const summary = summarize(answers);
	const heading = useRef<HTMLHeadingElement>(null);
	useEffect(() => {
		heading.current?.focus({ preventScroll: true });
	}, []);

	return (
		<>
			<SessionHeader
				courseId={courseId}
				courseName={courseName}
				topicName={topicName}
			/>
			<SessionLayout
				stackSides
				start={
					<>
						<SessionTitle
							courseName={courseName}
							topicName={topicName}
							className="hidden @5xl:flex"
						/>
						<section
							aria-labelledby="summary-title"
							className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-8 text-center"
						>
							<OrbitRing
								value={
									summary.total ? (summary.correct / summary.total) * 100 : 0
								}
								className="size-32 text-tone-green-foreground"
							>
								<span className="text-3xl font-semibold tracking-tight tabular-nums">
									{summary.correct}
									<span className="text-muted-foreground">
										/{summary.total}
									</span>
								</span>
							</OrbitRing>
							<h2
								id="summary-title"
								ref={heading}
								tabIndex={-1}
								className="text-lg font-semibold text-balance outline-none"
							>
								{summaryHeadline(summary)}
							</h2>
							<p className="sr-only">
								{summary.correct} of {summary.total} correct
							</p>
						</section>
					</>
				}
				end={
					<>
						<div className="flex flex-col gap-2">
							<Button
								onClick={onRestart}
								disabled={restarting}
								className="h-10 rounded-full px-4"
							>
								{restarting ? <Spinner /> : <RotateCcw />}
								Study again
							</Button>
							<Button
								asChild
								variant="outline"
								className="h-10 rounded-full px-4"
							>
								<Link href={courseRoute(courseId)}>Back to the course</Link>
							</Button>
						</div>
						<QuestionMap items={items} />
					</>
				}
			>
				<SlideIn>
					<MissedQuestions questions={questions} answers={answers} />
				</SlideIn>
			</SessionLayout>
		</>
	);
}
