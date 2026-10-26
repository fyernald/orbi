import type { TutorRequestInput } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import { composerActions } from './actions';
import type { Attachment, AttachmentStatus } from './attachments';
import { sendBlockedReason } from './composer';

const values = (
	changes: Partial<TutorRequestInput> = {}
): TutorRequestInput => ({
	action: 'ask',
	topicId: 'bio-meiosis',
	modelId: 'gemini-flash',
	message: 'Why does crossing over happen?',
	...changes,
});

const attachmentWith = (status: AttachmentStatus): Attachment => ({
	id: '1',
	file: new File(['notes'], 'notes.pdf'),
	kind: 'pdf',
	status,
	progress: status === 'ready' ? 1 : 0.5,
});

describe('sendBlockedReason', () => {
	it('allows a message or a finished file', () => {
		expect(sendBlockedReason({ values: values(), attachments: [] })).toBeNull();
		expect(
			sendBlockedReason({
				values: values({ action: 'questions', message: '' }),
				attachments: [attachmentWith('ready')],
			})
		).toBeNull();
	});

	it('uses the shared schema for the topic and model', () => {
		expect(
			sendBlockedReason({ values: values({ topicId: '' }), attachments: [] })
		).toBe('Choose a topic first.');
		expect(
			sendBlockedReason({ values: values({ modelId: '' }), attachments: [] })
		).toBe('Choose a model first.');
	});

	it("shows the action's own hint when there is nothing to send", () => {
		expect(
			sendBlockedReason({ values: values({ message: '   ' }), attachments: [] })
		).toBe(composerActions.ask.emptyHint);
	});

	it('lets a mock exam start without a message', () => {
		expect(
			sendBlockedReason({
				values: values({ action: 'mockExam', message: '' }),
				attachments: [],
			})
		).toBeNull();
	});

	it('waits for uploads and for failed files to be removed', () => {
		expect(
			sendBlockedReason({
				values: values(),
				attachments: [attachmentWith('uploading')],
			})
		).toMatch(/finish uploading/);
		expect(
			sendBlockedReason({
				values: values(),
				attachments: [attachmentWith('error')],
			})
		).toMatch(/could not be attached/);
	});
});
