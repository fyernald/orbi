import { describe, expect, it } from 'vitest';
import {
	canAddChoice,
	canRemoveChoice,
	removeChoice,
	toQuestionValues,
} from './question-form';

const choices = ['Prophase', 'Metaphase', 'Anaphase'];

describe('removeChoice', () => {
	it('keeps the mark on the same option when one below it goes', () => {
		expect(removeChoice({ choices, correctChoice: 1 }, 2)).toEqual({
			choices: ['Prophase', 'Metaphase'],
			correctChoice: 1,
		});
	});

	it('moves the mark up when an option above it goes', () => {
		expect(removeChoice({ choices, correctChoice: 2 }, 0)).toEqual({
			choices: ['Metaphase', 'Anaphase'],
			correctChoice: 1,
		});
	});

	it('leaves no option marked when the correct one goes', () => {
		expect(removeChoice({ choices, correctChoice: 1 }, 1)).toEqual({
			choices: ['Prophase', 'Anaphase'],
			correctChoice: undefined,
		});
	});

	it('leaves an unmarked question unmarked', () => {
		expect(removeChoice({ choices, correctChoice: undefined }, 0)).toEqual({
			choices: ['Metaphase', 'Anaphase'],
			correctChoice: undefined,
		});
	});
});

describe('how many options', () => {
	it('allows 2 to 4 options', () => {
		expect(canRemoveChoice(['A', 'B'])).toBe(false);
		expect(canRemoveChoice(['A', 'B', 'C'])).toBe(true);
		expect(canAddChoice(['A', 'B', 'C'])).toBe(true);
		expect(canAddChoice(['A', 'B', 'C', 'D'])).toBe(false);
	});
});

describe('toQuestionValues', () => {
	it('turns no explanation into an empty field', () => {
		expect(
			toQuestionValues({
				id: '1',
				topicId: '2',
				type: 'multiple_choice',
				text: 'Which phase?',
				choices,
				correctChoice: 1,
				explanation: null,
				status: 'approved',
				setId: null,
				createdAt: '2026-11-02T10:00:00.000Z',
			})
		).toEqual({
			text: 'Which phase?',
			choices,
			correctChoice: 1,
			explanation: '',
		});
	});
});
