import type { ReportReason } from '@orbi/shared';

// what each reason means to the student, in the order they are offered
export const reportReasons: {
	value: ReportReason;
	label: string;
	hint: string;
}[] = [
	{
		value: 'wrong_answer',
		label: 'The answer is wrong',
		hint: 'The answer marked correct is not right.',
	},
	{
		value: 'unclear',
		label: 'The question is unclear',
		hint: 'It is confusing, or more than one answer fits.',
	},
	{
		value: 'not_in_notes',
		label: 'It is not in my notes',
		hint: 'It asks about something your notes do not cover.',
	},
	{
		value: 'other',
		label: 'Something else',
		hint: 'Say what is wrong in the comment.',
	},
];
