import { APICallError } from 'ai';
import { describe, expect, it } from 'vitest';
import {
	canFollowUp,
	chatErrorMessage,
	hasVisibleContent,
	isRejectedRequest,
	messageToSend,
	type TutorUIMessage,
} from './chat';

const rejected = (status: number, responseBody: string) =>
	new APICallError({
		message: responseBody,
		url: '/api/chats/1/messages',
		requestBodyValues: undefined,
		statusCode: status,
		responseBody,
	});

describe('messageToSend', () => {
	it('keeps what the student wrote', () => {
		expect(messageToSend('questions', ' Only anaphase ', 'Mitosis')).toBe(
			'Only anaphase'
		);
	});

	it('writes a message for an empty Questions request', () => {
		expect(messageToSend('questions', '', 'Mitosis')).toBe(
			'Make practice questions from my notes on Mitosis'
		);
		expect(messageToSend('ask', '  ', 'Mitosis')).toBe('');
	});
});

describe('chatErrorMessage', () => {
	it("shows the server's own message for a refused request", () => {
		const error = rejected(
			400,
			JSON.stringify({
				error: { code: 'validation_error', message: 'Add notes first.' },
			})
		);

		expect(isRejectedRequest(error)).toBe(true);
		expect(chatErrorMessage(error)).toBe('Add notes first.');
	});

	it('falls back when the body is not Orbi JSON', () => {
		expect(chatErrorMessage(rejected(502, '<html>Bad gateway</html>'))).toBe(
			'Orbi could not answer. Try again.'
		);
	});

	it('explains a dropped connection instead of the browser wording', () => {
		expect(chatErrorMessage(new TypeError('network error'))).toBe(
			'Orbi could not be reached. Check your connection and try again.'
		);
	});

	it('shows the text the server wrote for a failed reply', () => {
		const error = new Error('Orbi is busy right now. Try again in a minute.');

		expect(isRejectedRequest(error)).toBe(false);
		expect(chatErrorMessage(error)).toBe(
			'Orbi is busy right now. Try again in a minute.'
		);
	});
});

describe('hasVisibleContent', () => {
	const reply = (parts: unknown[]) =>
		({ id: '1', role: 'assistant', parts }) as TutorUIMessage;

	it('waits for text or a card', () => {
		expect(hasVisibleContent(undefined)).toBe(false);
		expect(hasVisibleContent(reply([{ type: 'step-start' }]))).toBe(false);
		expect(hasVisibleContent(reply([{ type: 'text', text: ' ' }]))).toBe(false);
		expect(hasVisibleContent(reply([{ type: 'text', text: 'Hi' }]))).toBe(true);
		expect(
			hasVisibleContent(
				reply([{ type: 'tool-askStudent', state: 'input-streaming' }])
			)
		).toBe(true);
	});

	it('shows a reply once Orbi starts thinking', () => {
		expect(hasVisibleContent(reply([{ type: 'reasoning', text: '' }]))).toBe(
			false
		);
		expect(
			hasVisibleContent(reply([{ type: 'reasoning', text: 'The notes say' }]))
		).toBe(true);
	});
});

describe('canFollowUp', () => {
	const reply = (parts: TutorUIMessage['parts']): TutorUIMessage => ({
		id: '1',
		role: 'assistant',
		parts,
	});

	it('follows an explanation', () => {
		expect(canFollowUp(reply([{ type: 'text', text: 'Anaphase is…' }]))).toBe(
			true
		);
	});

	it('does not follow a question set or a question for the student', () => {
		const questions = reply([
			{
				type: 'tool-createQuestions',
				toolCallId: 'call-1',
				state: 'output-available',
				input: { questions: [] },
				output: { questionIds: [] },
			},
			{ type: 'text', text: 'Here are 5 questions.' },
		]);
		const asking = reply([
			{
				type: 'tool-askStudent',
				toolCallId: 'call-2',
				state: 'input-available',
				input: { question: 'Which part?', options: ['A', 'B'] },
			},
		]);

		expect(canFollowUp(questions)).toBe(false);
		expect(canFollowUp(asking)).toBe(false);
	});

	it("does not follow the student's own message or an empty reply", () => {
		expect(
			canFollowUp({ ...reply([{ type: 'text', text: 'Hi' }]), role: 'user' })
		).toBe(false);
		expect(canFollowUp(reply([{ type: 'text', text: '  ' }]))).toBe(false);
	});
});
