import {
	QUESTIONS_PER_SET_MAX,
	QUESTIONS_PER_SET_MIN,
	type ExplanationStyle,
	type TutorAction,
} from '@orbi/shared';
import type { CourseContext, NoteForTutor, StudentContext } from './repository';

// about 15,000 words; more notes than this are left out, oldest first
export const NOTES_CONTEXT_MAX_LENGTH = 60_000;

export type NotesSelection = { notes: NoteForTutor[]; total: number };

// keeps the newest notes that fit; a single note that is too long is cut
export function selectNotes(
	notes: NoteForTutor[],
	maxLength = NOTES_CONTEXT_MAX_LENGTH
): NotesSelection {
	const picked: NoteForTutor[] = [];
	let room = maxLength;
	for (const item of notes) {
		if (room <= 0) break;
		const content =
			item.content.length > room ? item.content.slice(0, room) : item.content;
		picked.push({ ...item, content });
		room -= content.length;
	}
	return { notes: picked, total: notes.length };
}

const styleRules: Record<ExplanationStyle, string> = {
	short: 'They like short, direct explanations.',
	step_by_step: 'They like explanations broken into small steps.',
	examples: 'They like explanations with concrete examples.',
};

const levelNames = {
	high_school: 'high school',
	undergraduate: 'university (undergraduate)',
	postgraduate: 'university (postgraduate)',
} as const;

function aboutStudent(student: StudentContext | undefined) {
	if (!student) return [];
	const lines: string[] = [];
	if (student.preferredName) {
		lines.push(
			`Their name is ${student.preferredName}. Use it now and then, not in every reply, and do not open replies with a greeting.`
		);
	}
	if (student.educationLevel) {
		const field = student.fieldOfStudy
			? `, studying ${student.fieldOfStudy}`
			: '';
		lines.push(`They are at ${levelNames[student.educationLevel]}${field}.`);
	}
	if (student.explanationStyle)
		lines.push(styleRules[student.explanationStyle]);
	if (student.locale === 'tr') {
		lines.push('Answer in Turkish unless they write in another language.');
	}
	return lines;
}

const escapeAttribute = (value: string) =>
	value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

function notesBlock(scopeName: string, selection: NotesSelection) {
	if (selection.notes.length === 0) {
		return `The student has no notes on ${scopeName} yet. Say so when it matters, and suggest adding notes.`;
	}
	const skipped = selection.total - selection.notes.length;
	const notes = selection.notes
		.map((item) => {
			const topic = item.topicName
				? ` topic="${escapeAttribute(item.topicName)}"`
				: '';
			const saved = item.createdAt.toISOString().slice(0, 10);
			return `<note title="${escapeAttribute(item.title)}"${topic} saved="${saved}">\n${item.content}\n</note>`;
		})
		.join('\n');
	const missing =
		skipped > 0 ? `\n${skipped} older notes did not fit and are left out.` : '';
	return `The student's notes on ${scopeName}, newest first:${missing}\n<notes>\n${notes}\n</notes>`;
}

export type InstructionsInput = {
	course: CourseContext;
	// null in the whole-course chat
	topic: { id: string; name: string } | null;
	student: StudentContext | undefined;
	notes: NotesSelection;
	action: TutorAction;
	today: Date;
};

// the system instructions for one reply
export function buildInstructions({
	course,
	topic,
	student,
	notes,
	action,
	today,
}: InstructionsInput): string {
	const exam =
		course.examDate && course.goal === 'exam_prep'
			? ` Their exam is on ${course.examDate}.`
			: '';
	const studying = topic
		? `"${topic.name}" in their course "${course.name}"`
		: `their course "${course.name}" as a whole`;
	const questions = topic
		? [
				`- When they want questions, a quiz, or practice, call createQuestions. Make ${QUESTIONS_PER_SET_MIN} questions unless they ask for another number (${QUESTIONS_PER_SET_MIN} to ${QUESTIONS_PER_SET_MAX}). Every question must be answerable from the notes, with one clearly correct choice and three wrong but believable ones. Put the correct choice in a different position each time. Mix easier and harder questions.`,
				'- After createQuestions, write one or two short sentences. Do not repeat the questions or the answers, the app shows them as cards.',
			]
		: [
				'- Practice questions belong to one topic. When they want questions, tell them to pick a topic in the message box first.',
			];

	const sections = [
		`You are Orbi, a friendly and patient study tutor. You are helping a student study ${studying}.${exam} Today is ${today.toISOString().slice(0, 10)}.`,
		aboutStudent(student).join(' '),
		[
			'How to answer:',
			"- Base your answers on the student's notes. When you add something that is not in the notes, start that part with **Beyond your notes:**.",
			'- Never claim the notes say something they do not.',
			'- Keep replies short and clear: short paragraphs, lists when they help, **bold** for key terms. Write maths in LaTeX between double dollar signs, also inside a sentence (for example $$2^n$$), never single ones.',
			'- Help the student think. When they ask you to check their understanding, ask them to explain it first.',
			...questions,
			'- If the request could mean very different things and the answer changes what you make, call askStudent once instead of guessing.',
			'- If they ask for something unrelated to studying, answer briefly and steer back to the course.',
		].join('\n'),
		notesBlock(topic?.name ?? course.name, notes),
	];

	if (action === 'questions' && topic) {
		sections.push(
			'The student pressed Questions: call createQuestions now. Read their message as extra instructions (what to focus on, how many, how hard).'
		);
	}

	return sections.filter(Boolean).join('\n\n');
}
