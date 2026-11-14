import type { Course, Topic, TutorAction } from '@orbi/shared';
import { composerActions } from '@/features/tutor/actions';

export type TutorStarter = {
	label: string;
	action: TutorAction;
	topicId?: string;
	message: string;
};

// an action that is not built yet is not suggested
const isBuilt = (action: TutorAction) => !composerActions[action].soon;

// ready-made first requests for the tutor, built from the course's own topics;
// only for actions that work, so a starter comes back once its action is built
export function tutorStarters(
	course: Course,
	topics: Topic[],
	isAvailable: (action: TutorAction) => boolean = isBuilt
): TutorStarter[] {
	const [first, second] = topics;
	if (!first) return [];

	const starters: TutorStarter[] = [
		{
			label: `Explain ${first.name} simply`,
			action: 'ask',
			topicId: first.id,
			message: `Explain ${first.name} simply, with one example.`,
		},
		{
			label: `Quiz me on ${(second ?? first).name}`,
			action: 'questions',
			topicId: (second ?? first).id,
			message: '',
		},
		{
			label: `Flashcards for ${first.name}`,
			action: 'flashcards',
			topicId: first.id,
			message: '',
		},
	];
	if (course.goal === 'exam_prep') {
		starters.push({
			label: `Mock exam for ${course.name}`,
			action: 'mockExam',
			topicId: first.id,
			message: '',
		});
	}
	return starters.filter(({ action }) => isAvailable(action));
}
