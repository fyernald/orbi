import { describe, expect, it } from 'vitest';
import { noteTime } from './note-time';

const now = new Date('2026-11-01T12:00:00Z');

describe('noteTime', () => {
	it('shows when a new note was saved', () => {
		const at = '2026-11-01T11:55:00.000Z';

		expect(noteTime({ createdAt: at, updatedAt: at }, now)).toEqual({
			dateTime: at,
			label: '5 min ago',
		});
	});

	it('shows when an edited note was last changed', () => {
		expect(
			noteTime(
				{
					createdAt: '2026-11-01T09:00:00.000Z',
					updatedAt: '2026-11-01T11:59:30.000Z',
				},
				now
			)
		).toEqual({
			dateTime: '2026-11-01T11:59:30.000Z',
			label: 'Edited just now',
		});
	});
});
