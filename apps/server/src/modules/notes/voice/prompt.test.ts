import { NOTE_CONTENT_MAX_LENGTH } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import {
	cleanVoiceText,
	modelMediaType,
	NO_SPEECH,
	tidyInstructions,
	transcriptInstructions,
} from './prompt';

describe('cleanVoiceText', () => {
	it('keeps the note as written, without spaces around it', () => {
		expect(cleanVoiceText('  Mitosis\n\n- Four phases \n')).toBe(
			'Mitosis\n\n- Four phases'
		);
	});

	it('takes the note out of a code block', () => {
		expect(cleanVoiceText('```text\nMitosis has four phases.\n```')).toBe(
			'Mitosis has four phases.'
		);
	});

	it('gives nothing for a recording without speech', () => {
		expect(cleanVoiceText(NO_SPEECH)).toBeNull();
		expect(cleanVoiceText(`  ${NO_SPEECH}\n`)).toBeNull();
		expect(cleanVoiceText('   ')).toBeNull();
	});

	it('keeps a note within the length of any note', () => {
		expect(
			cleanVoiceText('a'.repeat(NOTE_CONTENT_MAX_LENGTH + 10))
		).toHaveLength(NOTE_CONTENT_MAX_LENGTH);
	});
});

describe('the voice note instructions', () => {
	it('ask for plain text in the language spoken', () => {
		for (const instructions of [transcriptInstructions, tidyInstructions]) {
			expect(instructions).toContain('not Markdown');
			expect(instructions).toContain('language the student speaks');
			expect(instructions).toContain(NO_SPEECH);
		}
	});

	it('write down the words, or tidy them without adding any', () => {
		expect(transcriptInstructions).toContain('word for word');
		expect(tidyInstructions).toContain('Add nothing they did not say');
	});
});

describe('modelMediaType', () => {
	it("names Safari's MP4 audio the way Gemini knows it", () => {
		expect(modelMediaType('audio/mp4')).toBe('audio/m4a');
		expect(modelMediaType('audio/webm')).toBe('audio/webm');
	});
});
