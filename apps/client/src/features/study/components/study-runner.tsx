'use client';

import type { StudySession } from '@orbi/shared';
import { useState } from 'react';
import { SlideIn } from '@/components/slide-in';
import { questionMap } from '../question-map';
import {
	isFinished,
	nextQuestion,
	recordAnswer,
	skipQuestion,
	startRun,
} from '../session';
import { QuestionMap } from './question-map';
import { SessionAside } from './session-aside';
import { SessionHeader } from './session-header';
import { SessionLayout } from './session-layout';
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
	const { questions, courseName, topicName } = session;
	const total = questions.length;
	const items = questionMap(run, total);
	const question = questions[run.index];

	if (isFinished(run, total) || !question) {
		return (
			<SessionSummary
				courseId={courseId}
				courseName={courseName}
				topicName={topicName}
				questions={questions}
				answers={run.answers}
				items={items}
				restarting={restarting}
				onRestart={onRestart}
			/>
		);
	}

	return (
		<SessionLayout
			start={
				<SessionAside
					courseId={courseId}
					courseName={courseName}
					topicName={topicName}
					progress={{ done: run.answers.length, total }}
				/>
			}
			end={<QuestionMap items={items} />}
		>
			<SessionHeader
				courseId={courseId}
				courseName={courseName}
				topicName={topicName}
				progress={{ shown: run.index + 1, items }}
			/>
			<SlideIn key={question.id}>
				<SessionQuestion
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
			</SlideIn>
		</SessionLayout>
	);
}
