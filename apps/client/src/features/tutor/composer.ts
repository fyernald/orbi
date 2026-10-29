import { tutorRequestInput, type TutorRequestInput } from '@orbi/shared';
import { composerActions } from './actions';
import type { Attachment } from './attachments';

type ComposerState = {
	values: TutorRequestInput;
	attachments: Attachment[];
};

// why the composer cannot be sent yet, or null when it can; the form rules come
// from the shared schema, the file rules only exist in the browser
export function sendBlockedReason({
	values,
	attachments,
}: ComposerState): string | null {
	const parsed = tutorRequestInput.safeParse(values);
	if (!parsed.success) {
		return parsed.error.issues[0]?.message ?? 'Check the form first.';
	}
	if (attachments.some(({ status }) => status === 'uploading')) {
		return 'Wait for the files to finish uploading.';
	}
	if (attachments.some(({ status }) => status === 'error')) {
		return 'Remove the files that could not be attached.';
	}
	const { emptyHint } = composerActions[parsed.data.action];
	if (emptyHint && !parsed.data.message && attachments.length === 0) {
		return emptyHint;
	}
	return null;
}
