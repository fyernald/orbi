import type { TutorRequestInput } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import { composerActions } from './actions';
import type { Attachment } from './attachments';
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

const readyFile: Attachment = {
	id: '1',
	file: new File(['notes'], 'notes.pdf'),
	kind: 'pdf',
	status: 'ready',
	progress: 1,
};

describe('sendBlockedReason', () => {
	it('allows a message', () => {
		expect(sendBlockedReason({ values: values(), attachments: [] })).toBeNull();
	});

	it('lets Questions start from the saved notes without a message', () => {
		expect(
			sendBlockedReason({
				values: values({ action: 'questions', message: '' }),
				attachments: [],
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

	it('lets the whole-course chat send without a topic, except for questions', () => {
		expect(
			sendBlockedReason({
				values: values({ topicId: '' }),
				attachments: [],
				allowWholeCourse: true,
			})
		).toBeNull();
		expect(
			sendBlockedReason({
				values: values({ topicId: '', action: 'questions' }),
				attachments: [],
				allowWholeCourse: true,
			})
		).toMatch(/Pick a topic first/);
	});

	it("shows the action's own hint when there is nothing to send", () => {
		expect(
			sendBlockedReason({ values: values({ message: '   ' }), attachments: [] })
		).toBe(composerActions.ask.emptyHint);
	});

	it('says which actions are not ready yet', () => {
		expect(
			sendBlockedReason({
				values: values({ action: 'mockExam', message: '' }),
				attachments: [],
			})
		).toBe('Mock exam is coming soon.');
	});

	it('does not send files the tutor cannot read yet', () => {
		expect(
			sendBlockedReason({ values: values(), attachments: [readyFile] })
		).toMatch(/cannot read files yet/);
	});
});
