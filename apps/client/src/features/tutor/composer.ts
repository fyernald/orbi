import { tutorRequestInput, type TutorRequestInput } from '@orbi/shared';
import { composerActions } from './actions';
import type { Attachment } from './attachments';

type ComposerState = {
	values: TutorRequestInput;
	attachments: Attachment[];
	// the whole-course chat can send without a topic
	allowWholeCourse?: boolean;
};

// why the composer cannot be sent yet, or null when it can; the form rules come
// from the shared schema, the file rules only exist in the browser
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
	if (action.beta) return `${action.label} is coming soon.`;
	if (!parsed.data.topicId) {
		if (!allowWholeCourse) return 'Choose a topic first.';
		// questions are saved to one topic
		if (action.id === 'questions') {
			return 'Pick a topic first. Practice questions belong to one topic.';
		}
	}
	// the upload endpoint does not exist yet, so the tutor cannot read files
	if (attachments.length > 0) {
		return 'Orbi cannot read files yet. Paste the text into the message instead.';
	}
	if (action.emptyHint && !parsed.data.message) return action.emptyHint;
	return null;
}
