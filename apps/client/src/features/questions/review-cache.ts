import type { Question, ReviewTopic } from '@orbi/shared';

// A decided question stays in the cached list with its new status until the page
// loads again, so the student can still see it and undo it.

export function replaceQuestion(
	groups: ReviewTopic[],
	updated: Question
): ReviewTopic[] {
	return groups.map((group) =>
		group.topicId === updated.topicId
			? {
					...group,
					questions: group.questions.map((question) =>
						question.id === updated.id ? updated : question
					),
				}
			: group
	);
}

export function approveTopic(
	groups: ReviewTopic[],
	topicId: string
): ReviewTopic[] {
	return groups.map((group) =>
		group.topicId === topicId
			? {
					...group,
					questions: group.questions.map((question) =>
						question.status === 'pending'
							? { ...question, status: 'approved' as const }
							: question
					),
				}
			: group
	);
}

export const pendingIn = (questions: Question[]) =>
	questions.filter((question) => question.status === 'pending').length;

export const pendingCount = (groups: ReviewTopic[]) =>
	groups.reduce((count, group) => count + pendingIn(group.questions), 0);
