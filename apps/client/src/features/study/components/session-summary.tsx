'use client';

import type { StudyQuestion } from '@orbi/shared';
import { RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { courseRoute } from '@/lib/routes';
import { summarize, summaryHeadline, type StudyRun } from '../session';
import { MissedQuestions } from './missed-questions';
import { ResultGrid } from './result-grid';

type SessionSummaryProps = {
	courseId: string;
	questions: StudyQuestion[];
	answers: StudyRun['answers'];
	restarting: boolean;
	onRestart: () => void;
};

export function SessionSummary({
	courseId,
	questions,
	answers,
	restarting,
	onRestart,
}: SessionSummaryProps) {
	const summary = summarize(answers);
	const heading = useRef<HTMLHeadingElement>(null);
	useEffect(() => {
		heading.current?.focus({ preventScroll: true });
	}, []);

	return (
		<div className="flex flex-col gap-8">
			<section
				aria-labelledby="summary-title"
				className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-8 text-center"
			>
				<h2
					id="summary-title"
					ref={heading}
					tabIndex={-1}
					className="text-lg font-semibold outline-none"
				>
					{summaryHeadline(summary)}
				</h2>
				<p className="flex items-baseline gap-2">
					<span className="text-5xl font-semibold tracking-tight tabular-nums">
						{summary.correct}
						<span className="text-muted-foreground">/{summary.total}</span>
					</span>
					<span className="text-muted-foreground">correct</span>
				</p>
				<ResultGrid answers={answers} />
				<div className="mt-2 flex flex-wrap justify-center gap-2">
					<Button
						onClick={onRestart}
						disabled={restarting}
						className="h-9 rounded-full px-4"
					>
						{restarting ? <Spinner /> : <RotateCcw />}
						Study again
					</Button>
					<Button asChild variant="outline" className="h-9 rounded-full px-4">
						<Link href={courseRoute(courseId)}>Back to the course</Link>
					</Button>
				</div>
			</section>
			<MissedQuestions questions={questions} answers={answers} />
		</div>
	);
}
