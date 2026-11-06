import {
	NEW_QUESTIONS_PER_DAY,
	WEAK_MASTERY,
	type ChatAnswer,
	type Question,
	type QuestionInput,
	type QuestionSet,
	type QuestionStatus,
	type ReportQuestionInput,
	type ReviewTopic,
	type SessionAnswer,
	type StudySession,
	type TodayPlan,
	type TodayTopic,
	type TopicMastery,
} from '@orbi/shared';
import {
	createSm2Scheduler,
	defaultRating,
	localDate,
	masteryScore,
	startOfLocalDay,
	type ReviewScheduler,
	type ScoredAnswer,
} from '@orbi/core';
import { ConflictError, NotFoundError, ValidationError } from '../../errors';
import type {
	AnswerKey,
	PendingQuestion,
	QuestionContent,
	QuestionRepository,
	Reschedule,
	TopicAnswer,
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
	// with today, only the topic's questions in today's list
	startSession(
		userId: string,
		courseId: string,
		topicId: string,
		options?: { today?: boolean }
	): Promise<StudySession>;
	// what to study today, from every course
	today(userId: string): Promise<TodayPlan>;
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
	// every topic of the course, in course order
	listMastery(userId: string, courseId: string): Promise<TopicMastery[]>;
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

// the mastery score of every topic in the rows, in the order they came
function scoresByTopic(rows: TopicAnswer[], now: Date) {
	const byTopic = new Map<string, ScoredAnswer[]>();
	for (const { topicId, answer } of rows) {
		const answers = byTopic.get(topicId) ?? [];
		if (answer) answers.push(answer);
		byTopic.set(topicId, answers);
	}
	return new Map(
		[...byTopic].map(([topicId, answers]) => [
			topicId,
			masteryScore(answers, now),
		])
	);
}

// the weakest topic first; a topic not started yet comes after the scored ones,
// and more questions first between equals
const weakestFirst = (a: TodayTopic, b: TodayTopic) =>
	(a.mastery ?? 101) - (b.mastery ?? 101) ||
	b.dueCount + b.newCount - (a.dueCount + a.newCount);

function countBy<T>(items: T[], key: (item: T) => string) {
	const counts = new Map<string, number>();
	for (const item of items) {
		counts.set(key(item), (counts.get(key(item)) ?? 0) + 1);
	}
	return counts;
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
	scheduler = createSm2Scheduler(),
	now = () => new Date(),
}: {
	repo: QuestionRepository;
	scheduler?: ReviewScheduler;
	now?: () => Date;
}): QuestionService {
	// every answer moves the question's next review, in the chat and in sessions
	const rescheduleAfter =
		(correct: boolean): Reschedule =>
		(previous) =>
			scheduler.next(previous, defaultRating(correct), now());

	// Today's list: every approved question due before the student's tomorrow,
	// then new questions up to the daily limit. A new question answered today
	// counts toward that limit, so the list gets shorter as the student answers.
	const todayQueue = async (userId: string, at: Date) => {
		const timeZone = (await repo.findTimeZone(userId)) ?? 'UTC';
		const today = startOfLocalDay(at, timeZone);
		const tomorrow = startOfLocalDay(at, timeZone, 1);
		const [due, startedToday] = await Promise.all([
			repo.listDue(userId, tomorrow),
			repo.countScheduledSince(userId, today),
		]);
		const allowance = Math.max(0, NEW_QUESTIONS_PER_DAY - startedToday);
		const fresh =
			allowance > 0 ? await repo.listUnscheduled(userId, allowance) : [];
		return { timeZone, today, tomorrow, due, fresh };
	};

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
			const correct = choice === key.correctChoice;
			const saved = await repo.insertChatAnswer(
				userId,
				{ questionId, choice, correct },
				rescheduleAfter(correct)
			);
			if (!saved) {
				throw new ConflictError('You already answered this question.');
			}
			return saved;
		},

		async listChatAnswers(userId, questionIds) {
			return repo.listChatAnswers(userId, questionIds);
		},

		async startSession(userId, courseId, topicId, { today = false } = {}) {
			const names = await repo.findTopicNames(userId, courseId, topicId);
			if (!names) throw new NotFoundError('Topic not found.');
			const [approved, pendingCount, queue] = await Promise.all([
				repo.listApproved(userId, topicId),
				repo.countPending(userId, topicId),
				today ? todayQueue(userId, now()) : undefined,
			]);
			if (!queue) return { ...names, questions: approved, pendingCount };
			const inList = new Set(
				[...queue.due, ...queue.fresh]
					.filter((queued) => queued.topicId === topicId)
					.map(({ questionId }) => questionId)
			);
			const questions = approved.filter(({ id }) => inList.has(id));
			return { ...names, questions, pendingCount };
		},

		async today(userId) {
			const at = now();
			const queue = await todayQueue(userId, at);
			const { timeZone } = queue;
			const [topics, answers, dueDates, done] = await Promise.all([
				repo.listTopicsOfCourses(userId),
				repo.listTopicAnswers(userId),
				repo.listDueDates(
					userId,
					queue.tomorrow,
					startOfLocalDay(at, timeZone, 8)
				),
				repo.countAnswersSince(userId, queue.today),
			]);
			const scores = scoresByTopic(answers, at);
			const dueCounts = countBy(queue.due, ({ topicId }) => topicId);
			const newCounts = countBy(queue.fresh, ({ topicId }) => topicId);
			const withScore = topics.map(({ questionCount, ...topic }) => ({
				topic,
				questionCount,
				mastery: scores.get(topic.topicId) ?? null,
			}));

			const listed = withScore
				.map(({ topic, mastery }) => ({
					...topic,
					dueCount: dueCounts.get(topic.topicId) ?? 0,
					newCount: newCounts.get(topic.topicId) ?? 0,
					mastery,
				}))
				.filter(({ dueCount, newCount }) => dueCount + newCount > 0)
				.sort(weakestFirst);
			const upcoming = [
				...countBy(dueDates, (dueAt) => localDate(dueAt, timeZone)),
			]
				.map(([date, count]) => ({ date, count }))
				.sort((a, b) => a.date.localeCompare(b.date));
			const weakTopics = withScore
				.flatMap(({ topic, questionCount, mastery }) =>
					questionCount > 0 && mastery !== null && mastery < WEAK_MASTERY
						? [{ ...topic, mastery }]
						: []
				)
				.sort((a, b) => a.mastery - b.mastery)
				.slice(0, 2);
			const emptyTopics = withScore
				.filter(({ questionCount }) => questionCount === 0)
				.map(({ topic }) => topic)
				.slice(0, 2);

			return {
				date: localDate(at, timeZone),
				topics: listed,
				upcoming,
				answeredToday: done.answered,
				correctToday: done.correct,
				weakTopics,
				emptyTopics,
			};
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
			await repo.insertSessionAnswer(
				userId,
				saved,
				rescheduleAfter(saved.correct)
			);
			return {
				...saved,
				correctChoice: key.correctChoice,
				explanation: key.explanation,
			};
		},

		async listMastery(userId, courseId) {
			if (!(await repo.courseExists(userId, courseId))) {
				throw new NotFoundError('Course not found.');
			}
			const scores = scoresByTopic(
				await repo.listTopicAnswers(userId, courseId),
				now()
			);
			return [...scores].map(([topicId, score]) => ({ topicId, score }));
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
