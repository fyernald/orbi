import { describe, expect, it } from 'vitest';
import { courseDeletes, topicDeletes } from './deletion';

describe('courseDeletes', () => {
	it('lists the topics, notes, and study work of a course', () => {
		expect(courseDeletes({ topicCount: 3, noteCount: 1 })).toEqual([
			'3 topics',
			'1 note',
			'Its questions, answers, and tutor chats',
		]);
	});

	it('leaves out what an empty course does not have', () => {
		expect(courseDeletes({ topicCount: 0, noteCount: 0 })).toEqual([
			'Its questions, answers, and tutor chats',
		]);
	});
});

describe('topicDeletes', () => {
	it('lists the notes and study work of a topic', () => {
		expect(topicDeletes({ noteCount: 2 })).toEqual([
			'2 notes',
			'Its questions, answers, and tutor chats',
		]);
		expect(topicDeletes({ noteCount: 0 })).toEqual([
			'Its questions, answers, and tutor chats',
		]);
	});
});
