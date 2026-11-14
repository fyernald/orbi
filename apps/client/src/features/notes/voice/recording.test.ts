import type { AiModel } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import {
	cannotListenReason,
	formatDuration,
	joinNames,
	mediaTypeOf,
	micErrorMessage,
	pickRecordingType,
} from './recording';

const model = (id: string, label: string, audio: boolean): AiModel => ({
	id,
	label,
	provider: audio ? 'google' : 'anthropic',
	goodAt: '',
	audio,
});

const models = [
	model('gemini-flash', 'Gemini Flash', true),
	model('gemini-pro', 'Gemini Pro', true),
	model('claude-haiku', 'Claude Haiku', false),
];

describe('pickRecordingType', () => {
	it('takes Opus in WebM where the browser has it', () => {
		expect(pickRecordingType(() => true)).toBe('audio/webm;codecs=opus');
	});

	it('takes MP4 on Safari', () => {
		expect(pickRecordingType((type) => type === 'audio/mp4')).toBe('audio/mp4');
	});

	it('lets the browser choose when it knows none of them', () => {
		expect(pickRecordingType(() => false)).toBeUndefined();
	});
});

describe('mediaTypeOf', () => {
	it('sends the type without its codec', () => {
		expect(mediaTypeOf('audio/webm;codecs=opus')).toBe('audio/webm');
		expect(mediaTypeOf('audio/mp4; codecs="mp4a.40.2"')).toBe('audio/mp4');
	});

	it('knows only the types the server takes', () => {
		expect(mediaTypeOf('video/webm')).toBeUndefined();
	});
});

describe('formatDuration', () => {
	it('shows minutes and seconds', () => {
		expect(formatDuration(0)).toBe('0:00');
		expect(formatDuration(65.9)).toBe('1:05');
		expect(formatDuration(300)).toBe('5:00');
	});
});

describe('micErrorMessage', () => {
	const error = (name: string) => Object.assign(new Error('x'), { name });

	it('says how to allow a blocked microphone', () => {
		expect(micErrorMessage(error('NotAllowedError'))).toContain(
			'Allow it in your browser'
		);
	});

	it('says when there is no microphone, or it is busy', () => {
		expect(micErrorMessage(error('NotFoundError'))).toContain(
			'No microphone was found'
		);
		expect(micErrorMessage(error('NotReadableError'))).toContain(
			'in use by another app'
		);
	});

	it('has a message for anything else', () => {
		expect(micErrorMessage('?')).toBe(
			'Orbi could not start recording. Try again.'
		);
	});
});

describe('joinNames', () => {
	it('reads like a sentence', () => {
		expect(joinNames(['A'])).toBe('A');
		expect(joinNames(['A', 'B'])).toBe('A and B');
		expect(joinNames(['A', 'B', 'C'])).toBe('A, B and C');
		expect(joinNames(['A', 'B', 'C'], 'or')).toBe('A, B or C');
	});
});

describe('cannotListenReason', () => {
	it('lets a model that can listen record', () => {
		expect(cannotListenReason('gemini-flash', models)).toBeNull();
	});

	it('names the models that can listen', () => {
		expect(cannotListenReason('claude-haiku', models)).toBe(
			'Claude Haiku cannot listen to recordings. Pick Gemini Flash or Gemini Pro to make a voice note.'
		);
	});

	it('says when no model on the server can listen', () => {
		expect(cannotListenReason('claude-haiku', [models[2]!])).toBe(
			'None of the models on this server can listen to recordings yet.'
		);
	});
});
