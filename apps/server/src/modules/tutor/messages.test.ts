import { APICallError, RetryError } from 'ai';
import { describe, expect, it } from 'vitest';
import { chatTitle } from './chat-title';
import {
	hasContent,
	recentMessages,
	skipUnansweredQuestions,
	withoutEarlierThinking,
	withoutUnfinishedTools,
	type TutorUIMessage,
} from './messages';
import { replyErrorMessage } from './service';

const reply = (parts: unknown[]): TutorUIMessage => ({
	id: 'reply-1',
	role: 'assistant',
	parts: parts as TutorUIMessage['parts'],
});

const askPart = {
	type: 'tool-askStudent',
	toolCallId: 'call-1',
	state: 'input-available',
	input: { question: 'Which one?', options: ['A', 'B'] },
};

describe('withoutUnfinishedTools', () => {
	it('drops tool calls that were still being written or running', () => {
		const cleaned = withoutUnfinishedTools(
			reply([
				{ type: 'text', text: 'Here you go.' },
				{
					type: 'tool-createQuestions',
					toolCallId: 'a',
					state: 'input-streaming',
				},
				{
					type: 'tool-createQuestions',
					toolCallId: 'b',
					state: 'input-available',
					input: {},
				},
			])
		);

		expect(cleaned.parts.map((part) => part.type)).toEqual(['text']);
	});

	it('keeps a question that waits for the student', () => {
		const cleaned = withoutUnfinishedTools(reply([askPart]));

		expect(cleaned.parts).toHaveLength(1);
	});
});

describe('skipUnansweredQuestions', () => {
	it('marks an open question as skipped', () => {
		const skipped = skipUnansweredQuestions(reply([askPart]));

		expect(skipped?.parts[0]).toMatchObject({
			state: 'output-available',
			output: { answer: '', skipped: true },
		});
	});

	it('changes nothing when every question has an answer', () => {
		expect(
			skipUnansweredQuestions(reply([{ type: 'text', text: 'Hi' }]))
		).toBeUndefined();
	});
});

describe('hasContent', () => {
	it('is false for an empty or blank reply', () => {
		expect(hasContent(reply([]))).toBe(false);
		expect(hasContent(reply([{ type: 'text', text: '  ' }]))).toBe(false);
		expect(hasContent(reply([{ type: 'step-start' }]))).toBe(false);
	});

	it('is true for text or a question for the student', () => {
		expect(hasContent(reply([{ type: 'text', text: 'Hi' }]))).toBe(true);
		expect(hasContent(reply([askPart]))).toBe(true);
	});
});

describe('chatTitle', () => {
	it('uses the first line with text', () => {
		expect(
			chatTitle('\n  Explain anaphase  \nwith an example', 'Mitosis')
		).toBe('Explain anaphase');
	});

	it('falls back for an empty message and shortens a long one', () => {
		expect(chatTitle('   ', 'Mitosis')).toBe('Mitosis');
		const long = chatTitle('a'.repeat(300), 'Mitosis');
		expect(long).toHaveLength(120);
		expect(long.endsWith('…')).toBe(true);
	});
});

describe('replyErrorMessage', () => {
	it('explains a timeout', () => {
		const timeout = new Error('timed out');
		timeout.name = 'TimeoutError';

		expect(replyErrorMessage(timeout)).toBe(
			'Orbi took too long to answer. Try again.'
		);
	});

	it('looks inside the error the AI SDK gives after its retries', () => {
		const quota = new APICallError({
			message: 'You exceeded your current quota',
			url: 'https://ai.test',
			requestBodyValues: {},
			statusCode: 429,
		});
		const wrapped = new RetryError({
			message: 'Failed after 2 attempts.',
			reason: 'maxRetriesExceeded',
			errors: [quota, quota],
		});

		expect(replyErrorMessage(wrapped)).toMatch(/reached its limit/);
	});

	it('never shows the raw error to the student', () => {
		expect(replyErrorMessage(new Error('secret stack details'))).toBe(
			'Orbi could not answer. Try again.'
		);
	});
});

// a chat that takes turns, starting on the student
const turns = (count: number): TutorUIMessage[] =>
	Array.from({ length: count }, (_, index) => ({
		id: `message-${index}`,
		role: index % 2 === 0 ? 'user' : 'assistant',
		parts: [{ type: 'text', text: `Message ${index}` }],
	}));

describe('recentMessages', () => {
	it('keeps the newest 20 messages', () => {
		const recent = recentMessages(turns(26));

		expect(recent).toHaveLength(20);
		expect(recent.at(-1)!.id).toBe('message-25');
		expect(recent[0]!.role).toBe('user');
	});

	it("starts on the student's message, never on a reply", () => {
		const recent = recentMessages(turns(25));

		expect(recent[0]!.id).toBe('message-6');
		expect(recent).toHaveLength(19);
	});

	it('keeps a short chat as it is', () => {
		expect(recentMessages(turns(3))).toEqual(turns(3));
	});
});

describe('withoutEarlierThinking', () => {
	const thinkingReply = (id: string): TutorUIMessage => ({
		id,
		role: 'assistant',
		parts: [
			{ type: 'reasoning', text: 'Let me think.' },
			{ type: 'text', text: 'The answer.' },
		],
	});

	it("drops the thinking of earlier replies, not the student's text", () => {
		const [question] = turns(1);
		const cleaned = withoutEarlierThinking([
			question!,
			thinkingReply('reply-1'),
			{ ...question!, id: 'question-2' },
		]);

		expect(cleaned[1]!.parts).toEqual([{ type: 'text', text: 'The answer.' }]);
		expect(cleaned[0]).toEqual(question);
	});

	it('keeps the thinking of a reply that goes on after an answer', () => {
		const [question] = turns(1);
		const cleaned = withoutEarlierThinking([
			question!,
			thinkingReply('reply-1'),
			{ ...question!, id: 'question-2' },
			thinkingReply('reply-2'),
		]);

		expect(cleaned[1]!.parts.map(({ type }) => type)).toEqual(['text']);
		expect(cleaned[3]!.parts.map(({ type }) => type)).toEqual([
			'reasoning',
			'text',
		]);
	});
});
