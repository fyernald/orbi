import type { Course, Topic, TutorAction } from '@orbi/shared';

export type TutorStarter = {
	label: string;
	action: TutorAction;
	topicId?: string;
	message: string;
};

// ready-made first requests for the tutor, built from the course's own topics
export function tutorStarters(course: Course, topics: Topic[]): TutorStarter[] {
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
	return starters;
}
