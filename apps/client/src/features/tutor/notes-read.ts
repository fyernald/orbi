import type { TutorMessageMetadata } from '@orbi/shared';

const notes = (count: number) => (count === 1 ? '1 note' : `${count} notes`);

// What the line above a reply says about the notes, and whether some were missed.
// Replies saved before notesTotal was kept only say how many were read.
export function notesReadLabel(
	{
		notesUsed,
		notesTotal,
		notesCut,
	}: Pick<TutorMessageMetadata, 'notesUsed' | 'notesTotal' | 'notesCut'>,
	topic: string
): { text: string; partial: boolean } | undefined {
	if (notesUsed === undefined) return undefined;
	if (notesUsed === 0)
		return { text: `No notes on ${topic} yet`, partial: false };
	if (notesTotal !== undefined && notesUsed < notesTotal) {
		return {
			text: `Read ${notesUsed} of ${notes(notesTotal)} from ${topic}`,
			partial: true,
		};
	}
	if (notesCut) {
		const part = notesUsed === 1 ? 'only in part' : 'the last one only in part';
		return {
			text: `Read ${notes(notesUsed)} from ${topic}, ${part}`,
			partial: true,
		};
	}
	return { text: `Read ${notes(notesUsed)} from ${topic}`, partial: false };
}
