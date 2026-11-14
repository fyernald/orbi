import { NOTE_CONTENT_MAX_LENGTH, type VoiceNoteMediaType } from '@orbi/shared';

// five minutes of speech is about 1,000 words; a tidied note is shorter
export const VOICE_MAX_OUTPUT_TOKENS = 6_000;
export const VOICE_TIMEOUT_MS = 120_000;
// what the model answers for a recording without speech
export const NO_SPEECH = '[no speech]';

// The note is plain text, like a note the student types: it is shown and edited
// as it is, so it has no Markdown marks
const shared = [
	'The audio is a student speaking a note for their studies.',
	'Write in the language the student speaks.',
	'Write plain text, not Markdown: no #, no * or **, no tables.',
	`If the recording has no speech, answer only ${NO_SPEECH}`,
	'Answer with the note only, with nothing before or after it.',
];

export const transcriptInstructions = [
	...shared,
	'Write down what the student says, word for word. Add punctuation and start a new paragraph where a new idea starts. Leave out filler sounds like "uh" and "um", and change nothing else.',
].join('\n');

export const tidyInstructions = [
	...shared,
	'Turn what the student says into a clear study note.',
	'Fix mistakes in the speech and the grammar, and leave out repeats and filler words.',
	'Start with a short title on its own line. Put the ideas under short headings, each on its own line, and write lists with "- " at the start of each line.',
	'Keep every idea, term and number the student said, exactly. Add nothing they did not say.',
].join('\n');

export const voicePrompt = (tidy: boolean) =>
	tidy ? 'Turn this recording into a tidy note.' : 'Write down this recording.';

// Gemini's name for the MP4 audio Safari records
export const modelMediaType = (type: VoiceNoteMediaType): string =>
	type === 'audio/mp4' ? 'audio/m4a' : type;

const CODE_FENCE = /^```[\w-]*\n([\s\S]*?)\n```$/;

// the note's text, or null when the model heard no speech
export function cleanVoiceText(text: string): string | null {
	const trimmed = text.trim();
	const unfenced = (CODE_FENCE.exec(trimmed)?.[1] ?? trimmed).trim();
	if (!unfenced || unfenced === NO_SPEECH) return null;
	return unfenced.slice(0, NOTE_CONTENT_MAX_LENGTH);
}
