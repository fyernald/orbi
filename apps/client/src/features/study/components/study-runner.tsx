'use client';

import type { StudySession } from '@orbi/shared';
import { useState } from 'react';
import {
	isFinished,
	nextQuestion,
	recordAnswer,
	skipQuestion,
	startRun,
} from '../session';
import { SessionHeader } from './session-header';
import { SessionQuestion } from './session-question';
import { SessionSummary } from './session-summary';

type StudyRunnerProps = {
	courseId: string;
	session: StudySession;
	// the questions load again for "Study again"
	restarting: boolean;
	onRestart: () => void;
};

// one question at a time, then the summary
export function StudyRunner({
	courseId,
	session,
	restarting,
	onRestart,
}: StudyRunnerProps) {
	const [run, setRun] = useState(startRun);
	const { questions } = session;
	const total = questions.length;
	const finished = isFinished(run, total);
	const question = questions[run.index];

	return (
		<>
			<SessionHeader
				courseId={courseId}
				courseName={session.courseName}
				topicName={session.topicName}
				progress={{
					shown: Math.min(run.index + 1, total),
					done: run.answers.length,
					total,
				}}
			/>
			{finished || !question ? (
				<SessionSummary
					courseId={courseId}
					questions={questions}
					answers={run.answers}
					restarting={restarting}
					onRestart={onRestart}
				/>
			) : (
				<SessionQuestion
					key={question.id}
					question={question}
					// not the first one, which opens with the page
					focusOnShow={run.index > 0}
					answer={run.answers[run.index] ?? undefined}
					isLast={run.index === total - 1}
					onAnswered={(answer) =>
						setRun((current) => recordAnswer(current, answer))
					}
					onSkip={() => setRun(skipQuestion)}
					onNext={() => setRun(nextQuestion)}
				/>
			)}
		</>
	);
}
