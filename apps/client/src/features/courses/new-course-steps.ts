import type { CreateCourseInput } from '@orbi/shared';

export type NewCourseStep = {
	title: string;
	hint: string;
	heading: string;
	description: string;
	tip: string;
	// checked before the student can go on to the next step
	fields: (keyof CreateCourseInput)[];
};

export const newCourseSteps: NewCourseStep[] = [
	{
		title: 'Details',
		hint: 'Name and colour',
		heading: 'Course details',
		description:
			'Name the class you study for and pick a colour to spot it fast.',
		tip: 'Make one course for each class, for example Biology 101.',
		fields: ['name', 'description', 'color'],
	},
	{
		title: 'Goal',
		hint: 'What it is for',
		heading: 'What is this course for?',
		description: 'Orbi plans your reviews around it.',
		tip: 'Studying for an exam? Add the date and Orbi counts down the days.',
		fields: ['goal', 'examDate'],
	},
	{
		title: 'Topics',
		hint: 'First topics',
		heading: 'First topics',
		description:
			'Add the topics you already know about. You can add more later.',
		tip: 'Use the chapter names from your syllabus. Each topic gets its own notes and questions.',
		fields: ['topics'],
	},
];
