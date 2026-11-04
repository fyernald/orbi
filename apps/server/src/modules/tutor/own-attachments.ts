import type { MessageAttachment, SendChatMessageInput } from '@orbi/shared';
import type { TutorRepository } from './repository';

// an attached PDF was saved as notes first; only notes of the student in this
// course are kept, so a message cannot point at someone else's notes
export async function ownAttachments(
	repo: Pick<TutorRepository, 'ownNoteIds'>,
	userId: string,
	input: SendChatMessageInput
): Promise<MessageAttachment[] | undefined> {
	if (input.attachments.length === 0) return undefined;
	const own = new Set(
		await repo.ownNoteIds(
			userId,
			input.courseId,
			input.attachments.flatMap(({ noteIds }) => noteIds)
		)
	);
	const kept = input.attachments
		.map((file) => ({
			...file,
			noteIds: file.noteIds.filter((id) => own.has(id)),
		}))
		.filter(({ noteIds }) => noteIds.length > 0);
	return kept.length > 0 ? kept : undefined;
}
