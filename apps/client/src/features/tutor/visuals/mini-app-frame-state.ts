import type { HostMessage } from '@orbi/shared';

// The life of one mini-app frame, kept apart from React so it can be tested.
// loading: the sandbox page is on its way; starting: the code was sent and Orbi
// waits for ready; running: it works; failed: it was closed, with the reason.

// a slow phone may need a while for p5 (1 MB), but not longer than this
export const MINI_APP_START_MS = 10_000;
// how often the chat checks that the mini-app still answers, and how long it waits
export const MINI_APP_PING_MS = 2000;
export const MINI_APP_PONG_MS = 5000;

export const FRAME_MIN_HEIGHT = 120;
export const FRAME_MAX_HEIGHT = 560;
// the frame's height before the mini-app has said how tall it is
export const FRAME_START_HEIGHT = 240;

export type MiniAppFailure =
	// it threw an error while it started
	| 'crashed'
	// it did not start in time
	| 'slow'
	// it stopped answering, likely an endless loop
	| 'frozen'
	// it tried to leave the sandbox page
	| 'navigated';

export type FrameState =
	| { phase: 'loading' | 'starting'; height: number }
	| { phase: 'running'; height: number; lateError?: string }
	| { phase: 'failed'; failure: MiniAppFailure; detail?: string };

export type FrameEvent =
	| { type: 'loaded' }
	| { type: 'message'; message: HostMessage }
	| { type: 'timeout' }
	| { type: 'frozen' }
	| { type: 'navigated' };

export const initialFrameState: FrameState = {
	phase: 'loading',
	height: FRAME_START_HEIGHT,
};

// what the mini-app asked for, kept between the smallest and largest frame
export const frameHeight = (wanted: number, max = FRAME_MAX_HEIGHT) =>
	Math.round(Math.min(Math.max(wanted, FRAME_MIN_HEIGHT), max));

function onMessage(state: FrameState, message: HostMessage): FrameState {
	if (state.phase === 'failed' || state.phase === 'loading') return state;
	switch (message.type) {
		case 'ready':
			return state.phase === 'starting'
				? { phase: 'running', height: state.height }
				: state;
		case 'height':
			return { ...state, height: message.height };
		case 'error':
			// an error after it started leaves it running, with a note under it
			return state.phase === 'running'
				? { ...state, lateError: message.message }
				: { phase: 'failed', failure: 'crashed', detail: message.message };
		case 'pong':
			return state;
	}
}

export function frameReducer(state: FrameState, event: FrameEvent): FrameState {
	if (state.phase === 'failed') return state;
	switch (event.type) {
		case 'loaded':
			// a second load means the code sent the frame to another page
			return state.phase === 'loading'
				? { ...state, phase: 'starting' }
				: { phase: 'failed', failure: 'navigated' };
		case 'message':
			return onMessage(state, event.message);
		case 'timeout':
			return state.phase === 'running'
				? state
				: { phase: 'failed', failure: 'slow' };
		case 'frozen':
			return { phase: 'failed', failure: 'frozen' };
		case 'navigated':
			return { phase: 'failed', failure: 'navigated' };
	}
}

// what the student reads when a mini-app was closed
export const failureMessages: Record<MiniAppFailure, string> = {
	crashed: 'This mini-app hit an error while starting.',
	slow: 'This mini-app took too long to start, so Orbi closed it.',
	frozen: 'This mini-app stopped responding, so Orbi closed it.',
	navigated: 'This mini-app tried to open another page, so Orbi closed it.',
};
