import type { Note } from '@orbi/shared';
import { formatTimeAgo } from '@/lib/dates';

// when the note was saved, or last edited; a new note has both times the same
export function noteTime(
	{ createdAt, updatedAt }: Pick<Note, 'createdAt' | 'updatedAt'>,
	now: Date
): { dateTime: string; label: string } {
	if (updatedAt === createdAt) {
		return { dateTime: createdAt, label: formatTimeAgo(createdAt, now) };
	}
	return {
		dateTime: updatedAt,
		label: `Edited ${formatTimeAgo(updatedAt, now)}`,
	};
}
