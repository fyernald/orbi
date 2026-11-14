'use client';

import { useEffect, useRef, useState } from 'react';
import {
	micErrorMessage,
	NO_RECORDING_SUPPORT,
	pickRecordingType,
	RECORDING_BITS_PER_SECOND,
} from './recording';

export type Recording = { audio: Blob; type: string; seconds: number };

export type RecorderState =
	| { status: 'idle' }
	// waiting for the browser's microphone question
	| { status: 'starting' }
	| { status: 'recording'; seconds: number };

type RecorderOptions = {
	// the recording stops by itself here
	maxSeconds: number;
	onDone: (recording: Recording) => void;
	onError: (message: string) => void;
};

const TICK_MS = 250;

// One recording at a time from the microphone. The browser asks for the
// microphone the first time. Stop gives the recording to onDone; Cancel drops it.
// The microphone is let go as soon as the recording ends.
export function useRecorder({ maxSeconds, onDone, onError }: RecorderOptions) {
	const [state, setState] = useState<RecorderState>({ status: 'idle' });
	const recorder = useRef<MediaRecorder | null>(null);
	const cancelled = useRef(false);
	const timer = useRef<number | undefined>(undefined);
	// the latest callbacks, for the recorder's own events
	const callbacks = useRef({ onDone, onError });
	useEffect(() => {
		callbacks.current = { onDone, onError };
	});

	const stop = () => {
		if (recorder.current?.state === 'recording') recorder.current.stop();
	};

	const cancel = () => {
		cancelled.current = true;
		stop();
		setState({ status: 'idle' });
	};

	const start = async () => {
		if (
			typeof MediaRecorder === 'undefined' ||
			!navigator.mediaDevices?.getUserMedia
		) {
			onError(NO_RECORDING_SUPPORT);
			return;
		}
		setState({ status: 'starting' });
		let stream: MediaStream;
		try {
			stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		} catch (error) {
			setState({ status: 'idle' });
			onError(micErrorMessage(error));
			return;
		}

		const chunks: Blob[] = [];
		const media = new MediaRecorder(stream, {
			mimeType: pickRecordingType((type) =>
				MediaRecorder.isTypeSupported(type)
			),
			audioBitsPerSecond: RECORDING_BITS_PER_SECOND,
		});
		const startedAt = performance.now();
		const elapsed = () => (performance.now() - startedAt) / 1000;
		cancelled.current = false;
		recorder.current = media;

		media.ondataavailable = (event) => {
			if (event.data.size > 0) chunks.push(event.data);
		};
		media.onstop = () => {
			window.clearInterval(timer.current);
			stream.getTracks().forEach((track) => track.stop());
			recorder.current = null;
			setState({ status: 'idle' });
			if (cancelled.current) return;
			callbacks.current.onDone({
				audio: new Blob(chunks, { type: media.mimeType }),
				type: media.mimeType,
				seconds: Math.min(maxSeconds, Math.max(1, Math.round(elapsed()))),
			});
		};

		media.start(1000);
		setState({ status: 'recording', seconds: 0 });
		timer.current = window.setInterval(() => {
			const seconds = elapsed();
			if (seconds < maxSeconds) setState({ status: 'recording', seconds });
			else if (media.state === 'recording') media.stop();
		}, TICK_MS);
	};

	// a recording still running when the notes close is dropped
	useEffect(
		() => () => {
			cancelled.current = true;
			window.clearInterval(timer.current);
			if (recorder.current?.state === 'recording') recorder.current.stop();
		},
		[]
	);

	return { state, start, stop, cancel };
}
