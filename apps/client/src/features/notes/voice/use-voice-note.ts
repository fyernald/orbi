'use client';

import { VOICE_NOTE_MAX_SECONDS } from '@orbi/shared';
import { useEffect, useRef, useState } from 'react';
import { apiErrorMessage } from '@/lib/api';
import { mediaTypeOf } from './recording';
import { useRecorder, type Recording } from './use-recorder';
import { useWriteVoiceNote } from './voice-hooks';

export type VoiceNoteState =
	| { status: 'idle' }
	| { status: 'writing' }
	| { status: 'saved'; title: string }
	| { status: 'error'; message: string };

type VoiceNoteOptions = {
	courseId: string;
	topicId: string;
	// read when the recording stops, so a change while recording counts
	choice: () => { modelId: string; tidy: boolean };
};

// Record, then Orbi writes the note (US-47). Cancel stops either step, and
// nothing is saved then.
export function useVoiceNote({ courseId, topicId, choice }: VoiceNoteOptions) {
	const [state, setState] = useState<VoiceNoteState>({ status: 'idle' });
	const running = useRef<AbortController | null>(null);
	const { mutateAsync: writeNote } = useWriteVoiceNote(courseId, topicId);

	const write = ({ audio, type, seconds }: Recording) => {
		const mediaType = mediaTypeOf(type);
		if (!mediaType) {
			setState({
				status: 'error',
				message:
					'This browser records in a format Orbi cannot read. Try Chrome, Edge, Firefox or Safari.',
			});
			return;
		}
		const controller = new AbortController();
		running.current = controller;
		setState({ status: 'writing' });
		writeNote({
			audio,
			mediaType,
			seconds,
			signal: controller.signal,
			...choice(),
		})
			.then((created) => setState({ status: 'saved', title: created.title }))
			.catch((error: unknown) => {
				// cancelled by the student, who already sees the row again
				if (controller.signal.aborted) return;
				setState({ status: 'error', message: apiErrorMessage(error)! });
			});
	};

	const recorder = useRecorder({
		maxSeconds: VOICE_NOTE_MAX_SECONDS,
		onDone: write,
		onError: (message) => setState({ status: 'error', message }),
	});

	const start = () => {
		setState({ status: 'idle' });
		void recorder.start();
	};

	const cancel = () => {
		running.current?.abort();
		recorder.cancel();
		setState({ status: 'idle' });
	};

	// a note still being written when the notes close is stopped
	useEffect(() => () => running.current?.abort(), []);

	return {
		state,
		recorder: recorder.state,
		start,
		stop: recorder.stop,
		cancel,
	};
}
