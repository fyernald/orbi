import type { SessionAnswer, StudyQuestion } from '@orbi/shared';
import { choiceLetter } from '@/features/questions/choices';
import type { StudyRun } from '../session';

type MissedQuestionsProps = {
	questions: StudyQuestion[];
	answers: StudyRun['answers'];
};

// the wrong answers once more with the right one, to read before the next session
export function MissedQuestions({ questions, answers }: MissedQuestionsProps) {
	const missed = questions.flatMap((question, index) => {
		const answer = answers[index];
		return answer && !answer.correct
			? [{ question, answer, number: index + 1 }]
			: [];
	});
	if (missed.length === 0) {
		const answered = answers.some((answer) => answer !== null);
		return (
			<p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-pretty text-muted-foreground">
				{answered
					? 'Nothing to look at again. Every answer was right.'
					: 'No question was answered in this session.'}
			</p>
		);
	}

	return (
		<section aria-labelledby="missed-title" className="flex flex-col gap-3">
			<h2
				id="missed-title"
				className="text-sm font-medium text-muted-foreground"
			>
				To look at again
			</h2>
			<ul className="flex flex-col gap-2">
				{missed.map(({ question, answer, number }) => (
					<MissedQuestion
						key={question.id}
						question={question}
						answer={answer}
						number={number}
					/>
				))}
			</ul>
		</section>
	);
}

function MissedQuestion({
	question,
	answer,
	number,
}: {
	question: StudyQuestion;
	answer: SessionAnswer;
	number: number;
}) {
	return (
		<li className="flex flex-col gap-1.5 rounded-xl border border-border bg-card px-4 py-3">
			<span className="text-xs text-muted-foreground tabular-nums">
				Question {number}
			</span>
			<p className="text-[15px] leading-snug font-medium break-words">
				{question.text}
			</p>
			<p className="text-sm break-words text-tone-green-foreground">
				<span className="font-medium">
					{choiceLetter(answer.correctChoice)}.
				</span>{' '}
				{question.choices[answer.correctChoice]}
			</p>
			{answer.explanation && (
				<p className="text-sm text-subtle-foreground">{answer.explanation}</p>
			)}
		</li>
	);
}
