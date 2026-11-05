import type {
	ChatAnswer,
	Question,
	QuestionInput,
	QuestionSet,
	QuestionStatus,
	ReportQuestionInput,
	ReviewTopic,
	SessionAnswer,
	StudySession,
} from '@orbi/shared';
import { ConflictError, NotFoundError, ValidationError } from '../../errors';
import type {
	AnswerKey,
	PendingQuestion,
	QuestionContent,
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
	listForTopic(
		userId: string,
		courseId: string,
		topicId: string
	): Promise<Question[]>;
	listSets(userId: string, courseId: string): Promise<QuestionSet[]>;
	// a question the student writes is approved at once, so it is studied right away
	addQuestion(
		userId: string,
		courseId: string,
		topicId: string,
		input: QuestionInput
	): Promise<Question>;
	// changes what the question says; whether it waits for review stays the same
	updateQuestion(
		userId: string,
		courseId: string,
		topicId: string,
		questionId: string,
		input: QuestionInput
	): Promise<Question>;
	deleteQuestion(
		userId: string,
		courseId: string,
		topicId: string,
		questionId: string
	): Promise<void>;
	// a reported question is rejected, so it leaves study sessions and the review list
	reportQuestion(
		userId: string,
		questionId: string,
		report: ReportQuestionInput
	): Promise<Question>;
}

// an empty explanation is saved as none
const toContent = ({
	explanation,
	...content
}: QuestionInput): QuestionContent => ({
	...content,
	explanation: explanation || null,
});

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
	const requireTopic = async (
		userId: string,
		courseId: string,
		topicId: string
	) => {
		if (!(await repo.topicExists(userId, courseId, topicId))) {
			throw new NotFoundError('Topic not found.');
		}
	};

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
			await requireTopic(userId, courseId, topicId);
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

		async listForTopic(userId, courseId, topicId) {
			await requireTopic(userId, courseId, topicId);
			return repo.listForTopic(userId, topicId);
		},

		async listSets(userId, courseId) {
			if (!(await repo.courseExists(userId, courseId))) {
				throw new NotFoundError('Course not found.');
			}
			return repo.listSets(userId, courseId);
		},

		async addQuestion(userId, courseId, topicId, input) {
			await requireTopic(userId, courseId, topicId);
			return repo.insertManual(userId, topicId, toContent(input));
		},

		async updateQuestion(userId, courseId, topicId, questionId, input) {
			await requireTopic(userId, courseId, topicId);
			const updated = await repo.updateContent(
				userId,
				topicId,
				questionId,
				toContent(input)
			);
			if (!updated) throw new NotFoundError('Question not found.');
			return updated;
		},

		async deleteQuestion(userId, courseId, topicId, questionId) {
			await requireTopic(userId, courseId, topicId);
			if (!(await repo.deleteQuestion(userId, topicId, questionId))) {
				throw new NotFoundError('Question not found.');
			}
		},

		async reportQuestion(userId, questionId, report) {
			const reported = await repo.reportQuestion(userId, questionId, report);
			if (!reported) throw new NotFoundError('Question not found.');
			if (reported === 'already_reported') {
				throw new ConflictError('You already reported this question.');
			}
			return reported;
		},
	};
}
