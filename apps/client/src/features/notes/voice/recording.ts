import {
	VOICE_NOTE_MEDIA_TYPES,
	type AiModel,
	type VoiceNoteMediaType,
} from '@orbi/shared';

// What to ask the browser for, best first: Chrome and Firefox record Opus in
// WebM or Ogg, Safari AAC in MP4. All of them are formats Gemini takes.
export const RECORDING_TYPES = [
	'audio/webm;codecs=opus',
	'audio/ogg;codecs=opus',
	'audio/mp4',
	'audio/webm',
];
// clear enough for speech, and five minutes stay well under the server's limit
export const RECORDING_BITS_PER_SECOND = 48_000;

export const NO_RECORDING_SUPPORT =
	'This browser cannot record audio. Try a recent Chrome, Edge, Firefox or Safari.';

// the first type this browser can record, or undefined to let it choose
export function pickRecordingType(
	isSupported: (type: string) => boolean
): string | undefined {
	return RECORDING_TYPES.find((type) => isSupported(type));
}

// "audio/webm;codecs=opus" is sent as audio/webm; undefined for a type the
// server does not take
export function mediaTypeOf(recorded: string): VoiceNoteMediaType | undefined {
	const base = recorded.split(';')[0]!.trim().toLowerCase();
	return VOICE_NOTE_MEDIA_TYPES.find((type) => type === base);
}

// 65 seconds as "1:05"
export function formatDuration(seconds: number): string {
	const whole = Math.max(0, Math.floor(seconds));
	return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

// what the browser said when it could not open the microphone
export function micErrorMessage(error: unknown): string {
	const name = error instanceof Error ? error.name : '';
	if (name === 'NotAllowedError' || name === 'SecurityError') {
		return "Orbi cannot use your microphone. Allow it in your browser's site settings, then try again.";
	}
	if (name === 'NotFoundError' || name === 'OverconstrainedError') {
		return 'No microphone was found. Connect one and try again.';
	}
	if (name === 'NotReadableError') {
		return 'Your microphone is in use by another app. Close it and try again.';
	}
	return 'Orbi could not start recording. Try again.';
}

// "A", "A or B", "A, B or C"
export function joinNames(names: string[], last: 'and' | 'or' = 'and'): string {
	if (names.length <= 1) return names[0] ?? '';
	return `${names.slice(0, -1).join(', ')} ${last} ${names.at(-1)}`;
}

// Why the picked model cannot make a voice note, or null when it can. Only some
// models can listen to audio, and Orbi never picks another one by itself.
export function cannotListenReason(
	modelId: string,
	models: AiModel[]
): string | null {
	const picked = models.find((model) => model.id === modelId);
	if (!picked || picked.audio) return null;
	const listening = models
		.filter((model) => model.audio)
		.map((model) => model.label);
	if (listening.length === 0) {
		return 'None of the models on this server can listen to recordings yet.';
	}
	return `${picked.label} cannot listen to recordings. Pick ${joinNames(listening, 'or')} to make a voice note.`;
}
