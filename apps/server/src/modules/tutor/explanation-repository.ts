import type { AiProvider } from '@orbi/shared';
import { and, eq } from 'drizzle-orm';
import type { Db } from '../../db';
import { answerExplanation, question, topic } from '../../db/schema';

// what the model needs to explain a wrong answer to this question
export type QuestionToExplain = {
	id: string;
	topicId: string;
	topicName: string;
	text: string;
	choices: string[];
	correctChoice: number;
	// the short reason saved with the question, if any
	explanation: string | null;
};

export type NewExplanation = {
	questionId: string;
	choice: number;
	text: string;
	aiProvider: AiProvider;
	aiModel: string;
};

// the explanations of wrong answers in study sessions (US-07)
export interface ExplanationRepository {
	findQuestion(
		userId: string,
		questionId: string
	): Promise<QuestionToExplain | undefined>;
	findExplanation(
		userId: string,
		questionId: string,
		choice: number
	): Promise<string | undefined>;
	// gives back the saved text: when two are written at once, the first one stays
	saveExplanation(userId: string, input: NewExplanation): Promise<string>;
}

const ownExplanation = (userId: string, questionId: string, choice: number) =>
	and(
		eq(answerExplanation.userId, userId),
		eq(answerExplanation.questionId, questionId),
		eq(answerExplanation.choice, choice)
	);

export function createExplanationRepository(db: Db): ExplanationRepository {
	async function findExplanation(
		userId: string,
		questionId: string,
		choice: number
	) {
		const [found] = await db
			.select({ text: answerExplanation.text })
			.from(answerExplanation)
			.where(ownExplanation(userId, questionId, choice));
		return found?.text;
	}

	return {
		async findQuestion(userId, questionId) {
			const [found] = await db
				.select({
					id: question.id,
					topicId: question.topicId,
					topicName: topic.name,
					text: question.text,
					choices: question.choices,
					correctChoice: question.correctChoice,
					explanation: question.explanation,
				})
				.from(question)
				.innerJoin(
					topic,
					and(eq(topic.userId, question.userId), eq(topic.id, question.topicId))
				)
				.where(and(eq(question.userId, userId), eq(question.id, questionId)));
			return found;
		},

		findExplanation,

		async saveExplanation(userId, input) {
			const [saved] = await db
				.insert(answerExplanation)
				.values({ userId, ...input })
				.onConflictDoNothing({
					target: [
						answerExplanation.userId,
						answerExplanation.questionId,
						answerExplanation.choice,
					],
				})
				.returning({ text: answerExplanation.text });
			if (saved) return saved.text;
			return (await findExplanation(userId, input.questionId, input.choice))!;
		},
	};
}
