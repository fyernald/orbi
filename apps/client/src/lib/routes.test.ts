import { describe, expect, it } from 'vitest';
import { courseRoute } from './routes';

describe('courseRoute', () => {
	it('opens the course on its own', () => {
		expect(courseRoute('c1')).toBe('/app/courses/c1');
	});

	it("opens a topic's chat with the message, action, model, and Think ready", () => {
		expect(
			courseRoute('c1', {
				topic: 't1',
				tool: 'questions',
				ask: 'Only anaphase & telophase',
				model: 'gemini-flash',
				think: true,
			})
		).toBe(
			'/app/courses/c1?tool=questions&ask=Only+anaphase+%26+telophase&topic=t1&model=gemini-flash&think=1'
		);
	});

	it("shows a topic's notes in place of the chat", () => {
		expect(courseRoute('c1', { topic: 't1', notes: 't2' })).toBe(
			'/app/courses/c1?topic=t1&notes=t2'
		);
	});

	it('leaves out what is not given', () => {
		expect(courseRoute('c1', { ask: '', think: false })).toBe(
			'/app/courses/c1'
		);
	});
});
