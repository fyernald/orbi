import { tutorRequestInput, type TutorRequestInput } from '@orbi/shared';
import { composerActions } from './actions';
import { attachmentSummary, type Attachment } from './attachments';

// a topic as the composer shows it: the course name comes with it
export type ComposerTopic = {
	id: string;
	course: string;
	name: string;
};

type ComposerState = {
	values: Partial<TutorRequestInput>;
	attachments: Attachment[];
	// the whole-course chat can send without a topic
	allowWholeCourse?: boolean;
};

// why the composer cannot be sent yet, or null when it can; the form rules come
// from the shared schema
export function sendBlockedReason({
	values,
	attachments,
	allowWholeCourse = false,
}: ComposerState): string | null {
	const parsed = tutorRequestInput.safeParse(values);
	if (!parsed.success) {
		return parsed.error.issues[0]?.message ?? 'Check the form first.';
	}
	const action = composerActions[parsed.data.action];
	if (action.soon) return `${action.label} is coming soon.`;
	if (!parsed.data.topicId) {
		if (!allowWholeCourse) return 'Choose a topic first.';
		// questions are saved to one topic
		if (action.id === 'questions') {
			return 'Pick a topic first. Practice questions belong to one topic.';
		}
	}
	// an attached PDF is read on the server first, and the tutor reads its text
	if (attachments.some((file) => file.status === 'uploading')) {
		return 'Wait until Orbi has read your PDFs.';
	}
	const failed = attachments.find((file) => file.status === 'error');
	if (failed) {
		const reason = attachmentSummary(failed).replace(/\.$/, '');
		return `${failed.file.name}: ${reason}. Remove it to send.`;
	}
	if (action.emptyHint && !parsed.data.message) return action.emptyHint;
	return null;
}
