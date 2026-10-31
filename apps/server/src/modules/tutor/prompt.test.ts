import { describe, expect, it } from 'vitest';
import { buildInstructions, selectNotes } from './prompt';
import type { CourseContext, NoteForTutor } from './repository';

const note = (id: string, content: string): NoteForTutor => ({
	id,
	title: `Note ${id}`,
	content,
	createdAt: new Date('2026-10-30T10:00:00Z'),
});

const course: CourseContext = {
	id: 'course-1',
	name: 'Biology 101',
	goal: 'exam_prep',
	examDate: '2026-12-15',
};
const topic = { id: 'topic-1', name: 'Mitosis' };

describe('selectNotes', () => {
	it('keeps every note that fits', () => {
		const selection = selectNotes([note('a', 'aaaa'), note('b', 'bbbb')], 100);

		expect(selection.notes.map(({ id }) => id)).toEqual(['a', 'b']);
		expect(selection.total).toBe(2);
	});

	it('drops the oldest notes and cuts the last one that only fits in part', () => {
		const selection = selectNotes(
			[
				note('new', 'x'.repeat(8)),
				note('mid', 'y'.repeat(8)),
				note('old', 'z'),
			],
			10
		);

		expect(selection.notes.map(({ id }) => id)).toEqual(['new', 'mid']);
		expect(selection.notes[1]!.content).toBe('yy');
		expect(selection.total).toBe(3);
	});
});

describe('buildInstructions', () => {
	const base = {
		course,
		topic,
		student: undefined,
		notes: selectNotes([note('a', 'Anaphase: chromatids separate.')]),
		action: 'ask' as const,
		today: new Date('2026-11-01T09:00:00Z'),
	};

	it('gives the model the topic, the exam date, and the notes', () => {
		const instructions = buildInstructions(base);

		expect(instructions).toContain('"Mitosis"');
		expect(instructions).toContain('2026-12-15');
		expect(instructions).toContain('Anaphase: chromatids separate.');
	});

	it('asks for maths the chat can draw', () => {
		// the chat only reads $$...$$, so prices like $5 are never taken for maths
		expect(buildInstructions(base)).toContain('double dollar signs');
	});

	it('says when a topic has no notes', () => {
		const instructions = buildInstructions({ ...base, notes: selectNotes([]) });

		expect(instructions).toContain('no notes on Mitosis yet');
	});

	it('tells the model to make questions for the Questions action', () => {
		expect(buildInstructions({ ...base, action: 'questions' })).toContain(
			'call createQuestions now'
		);
		expect(buildInstructions(base)).not.toContain('call createQuestions now');
	});

	it('studies the whole course without making questions', () => {
		const instructions = buildInstructions({
			...base,
			topic: null,
			notes: selectNotes([
				{ ...note('a', 'Crossing over.'), topicName: 'Meiosis' },
			]),
		});

		expect(instructions).toContain('"Biology 101" as a whole');
		expect(instructions).toContain('topic="Meiosis"');
		expect(instructions).toContain('pick a topic in the message box');
		expect(instructions).not.toContain('call createQuestions');
	});

	it('follows how the student likes explanations', () => {
		const instructions = buildInstructions({
			...base,
			student: {
				preferredName: 'Ada',
				educationLevel: 'undergraduate',
				fieldOfStudy: 'Biology',
				explanationStyle: 'examples',
				locale: 'en',
			},
		});

		expect(instructions).toContain('Their name is Ada.');
		expect(instructions).toContain('studying Biology');
		expect(instructions).toContain('concrete examples');
	});

	it('keeps a quote in a note title from breaking the notes block', () => {
		const instructions = buildInstructions({
			...base,
			notes: selectNotes([{ ...note('a', 'text'), title: 'The "S" phase' }]),
		});

		expect(instructions).toContain('title="The &quot;S&quot; phase"');
	});
});
