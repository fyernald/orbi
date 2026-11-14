import { describe, expect, it } from 'vitest';
import {
	courseAddressHref,
	notesHistoryState,
	parseCourseAddress,
	wereNotesOpenedHere,
} from './course-address';

const topic = '0199be1c-22a3-4125-82fa-a5ce6a906072';
const other = '0199be1c-22a3-4125-82fa-a5ce6a906073';

describe('parseCourseAddress', () => {
	it('reads the open chat and the topic whose notes show', () => {
		const params = new URLSearchParams({ topic, notes: other });

		expect(parseCourseAddress(params)).toEqual({
			topicId: topic,
			notesTopicId: other,
		});
	});

	it('takes the whole-course chat and no notes when they are missing or wrong', () => {
		expect(parseCourseAddress(new URLSearchParams())).toEqual({
			topicId: null,
			notesTopicId: null,
		});
		expect(
			parseCourseAddress(new URLSearchParams({ topic: 'x', notes: 'y' }))
		).toEqual({ topicId: null, notesTopicId: null });
	});
});

describe('courseAddressHref', () => {
	it('keeps the chat behind the notes', () => {
		expect(
			courseAddressHref('c1', { topicId: topic, notesTopicId: other })
		).toBe(`/app/courses/c1?topic=${topic}&notes=${other}`);
	});

	it('opens the whole-course chat on its own', () => {
		expect(courseAddressHref('c1', { topicId: null, notesTopicId: null })).toBe(
			'/app/courses/c1'
		);
	});
});

describe('notes opened on this page', () => {
	it('are marked on their history entry', () => {
		expect(wereNotesOpenedHere(notesHistoryState(true))).toBe(true);
	});

	it('are not, from a link, a new tab or another entry', () => {
		expect(wereNotesOpenedHere(notesHistoryState(false))).toBe(false);
		expect(wereNotesOpenedHere(null)).toBe(false);
		expect(wereNotesOpenedHere({ __NA: true })).toBe(false);
		expect(wereNotesOpenedHere('notes')).toBe(false);
	});
});
