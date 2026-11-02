import type {
	ChatAnswer,
	Question,
	QuestionStatus,
	ReviewTopic,
	SessionAnswer,
	StudySession,
} from '@orbi/shared';
import { ConflictError, NotFoundError, ValidationError } from '../../errors';
import type {
	AnswerKey,
	PendingQuestion,
	QuestionRepository,
} from './repository';

export interface QuestionService {
	listForReview(userId: string): Promise<ReviewTopic[]>;
	setStatus(
		userId: string,
		questionId: string,
		status: QuestionStatus
	): Promise<Question>;
	approveTopic(
		userId: string,
		courseId: string,
		topicId: string
	): Promise<{ approved: number }>;
	// a practice question in the chat is tried once; the server decides if it is right
	answerInChat(
		userId: string,
		questionId: string,
		choice: number
	): Promise<ChatAnswer>;
	listChatAnswers(userId: string, questionIds: string[]): Promise<ChatAnswer[]>;
	startSession(
		userId: string,
		courseId: string,
		topicId: string
	): Promise<StudySession>;
	// only approved questions are studied; every answer is saved for the mastery score
	answerInSession(
		userId: string,
		questionId: string,
		choice: number
	): Promise<SessionAnswer>;
}

// another user's question answers the same as a missing one, so ids cannot be probed
function checkChoice(key: AnswerKey | undefined, choice: number): AnswerKey {
	if (!key) throw new NotFoundError('Question not found.');
	if (choice >= key.choiceCount) {
		throw new ValidationError('Pick one of the answers.');
	}
	return key;
}

// one group per topic; the topic with the newest questions comes first
export function groupByTopic(pending: PendingQuestion[]): ReviewTopic[] {
	const groups = new Map<string, ReviewTopic>();
	for (const {
		question,
		courseId,
		courseName,
		courseColor,
		topicName,
	} of pending) {
		const group = groups.get(question.topicId);
		if (group) {
			group.questions.push(question);
		} else {
			groups.set(question.topicId, {
				courseId,
				courseName,
				courseColor,
				topicId: question.topicId,
				topicName,
				questions: [question],
			});
		}
	}
	const newest = (group: ReviewTopic) => group.questions.at(-1)!.createdAt;
	return [...groups.values()].sort((a, b) =>
		newest(b).localeCompare(newest(a))
	);
}

export function createQuestionService({
	repo,
}: {
	repo: QuestionRepository;
}): QuestionService {
	return {
		async listForReview(userId) {
			return groupByTopic(await repo.listPending(userId));
		},

		// another user's question answers the same as a missing one, so ids cannot be probed
		async setStatus(userId, questionId, status) {
			const updated = await repo.setStatus(userId, questionId, status);
			if (!updated) throw new NotFoundError('Question not found.');
			return updated;
		},

		async approveTopic(userId, courseId, topicId) {
			if (!(await repo.topicExists(userId, courseId, topicId))) {
				throw new NotFoundError('Topic not found.');
			}
			return { approved: await repo.approvePending(userId, topicId) };
		},

		async answerInChat(userId, questionId, choice) {
			const key = checkChoice(
				await repo.findAnswerKey(userId, questionId),
				choice
			);
			const saved = await repo.insertChatAnswer(userId, {
				questionId,
				choice,
				correct: choice === key.correctChoice,
			});
			if (!saved) {
				throw new ConflictError('You already answered this question.');
			}
			return saved;
		},

		async listChatAnswers(userId, questionIds) {
			return repo.listChatAnswers(userId, questionIds);
		},

		async startSession(userId, courseId, topicId) {
			const names = await repo.findTopicNames(userId, courseId, topicId);
			if (!names) throw new NotFoundError('Topic not found.');
			const [questions, pendingCount] = await Promise.all([
				repo.listApproved(userId, topicId),
				repo.countPending(userId, topicId),
			]);
			return { ...names, questions, pendingCount };
		},

		async answerInSession(userId, questionId, choice) {
			const key = checkChoice(
				await repo.findAnswerKey(userId, questionId),
				choice
			);
			// rejected or sent back for review in another tab while the session was open
			if (key.status !== 'approved') {
				throw new ConflictError(
					'This question is no longer in your study questions.'
				);
			}
			const saved = {
				questionId,
				choice,
				correct: choice === key.correctChoice,
			};
			await repo.insertSessionAnswer(userId, saved);
			return {
				...saved,
				correctChoice: key.correctChoice,
				explanation: key.explanation,
			};
		},
	};
}
