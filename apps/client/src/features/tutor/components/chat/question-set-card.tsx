'use client';

import { CHOICES_PER_QUESTION, type GeneratedQuestion } from '@orbi/shared';
import { CircleHelp } from 'lucide-react';
import type { ToolViewProps } from './tool-views';
import { QuizQuestion } from './quiz-question';

// a question counts as written once its text and all its choices have arrived
function writtenQuestions(input: unknown): GeneratedQuestion[] {
	const questions = (input as { questions?: Partial<GeneratedQuestion>[] })
		?.questions;
	if (!Array.isArray(questions)) return [];
	return questions.filter(
		(question): question is GeneratedQuestion =>
			typeof question?.text === 'string' &&
			Array.isArray(question.choices) &&
			question.choices.length === CHOICES_PER_QUESTION &&
			question.choices.every((choice) => typeof choice === 'string') &&
			typeof question.correctChoice === 'number' &&
			typeof question.explanation === 'string'
	);
}

// the createQuestions tool: cards fill in one by one while the AI writes them
export function QuestionSetCard({ part }: ToolViewProps<'createQuestions'>) {
	if (part.state === 'output-error') {
		return (
			<p className="text-sm text-muted-foreground">
				One set of questions did not pass Orbi&apos;s checks, so it was not
				saved.
			</p>
		);
	}

	const questions = writtenQuestions(part.input);
	const saved = part.state === 'output-available';
	const writing = part.state === 'input-streaming';
	const total = saved || !writing ? questions.length : questions.length + 1;

	return (
		<section
			aria-label="Practice questions"
			className="overflow-hidden rounded-2xl border border-border bg-card"
		>
			<header className="flex flex-wrap items-center gap-2 border-b border-divider px-4 py-2.5">
				<CircleHelp className="size-4 text-muted-foreground" />
				<h4 className="text-sm font-semibold">
					{saved
						? `${questions.length} practice questions`
						: writing
							? 'Writing questions…'
							: 'Saving questions…'}
				</h4>
				{saved && (
					<span className="rounded-full bg-tone-amber px-2 py-0.5 text-xs font-medium text-tone-amber-foreground">
						Waiting for your review
					</span>
				)}
			</header>
			<ol className="divide-y divide-divider">
				{questions.map((question, index) => (
					<QuizQuestion
						key={index}
						question={question}
						number={index + 1}
						total={total}
						answerable={saved}
					/>
				))}
				{writing && (
					<li aria-hidden className="flex flex-col gap-2.5 px-4 py-3.5">
						<span className="shimmer-text text-xs font-medium">
							Writing question {questions.length + 1}…
						</span>
						<span className="h-3 w-4/5 animate-pulse rounded bg-muted" />
						<span className="h-3 w-1/2 animate-pulse rounded bg-muted" />
					</li>
				)}
			</ol>
			{saved && (
				<p className="border-t border-divider px-4 py-2.5 text-xs text-muted-foreground">
					Try each one first. The questions are saved to this topic, and you
					approve them before they go into your practice.
				</p>
			)}
		</section>
	);
}
