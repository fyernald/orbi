'use client';

import {
	isHostMessage,
	type MiniAppCode,
	type ParentMessage,
	type RunMessage,
} from '@orbi/shared';
import { useTheme } from 'next-themes';
import {
	useCallback,
	useEffect,
	useReducer,
	useRef,
	type SyntheticEvent,
} from 'react';
import { usePalette } from '@/hooks/use-palette';
import {
	frameReducer,
	initialFrameState,
	MINI_APP_PING_MS,
	MINI_APP_PONG_MS,
	MINI_APP_START_MS,
} from './mini-app-frame-state';
import { readSandboxTheme } from './sandbox-theme';

// Runs one mini-app in a sandbox frame: sends it the code and the theme once the
// sandbox page has loaded, then watches it. It must start in time and keep
// answering; one that does not is closed, which also stops its process.
export function useMiniAppFrame(app: MiniAppCode) {
	const [state, dispatch] = useReducer(frameReducer, initialFrameState);
	const { resolvedTheme } = useTheme();
	const palette = usePalette();
	const dark = resolvedTheme === 'dark';
	const port = useRef<MessagePort | null>(null);
	// when the last unanswered ping was sent
	const waitingSince = useRef<number | null>(null);
	const loads = useRef(0);

	const onLoad = useCallback(
		(event: SyntheticEvent<HTMLIFrameElement>) => {
			loads.current += 1;
			dispatch({ type: 'loaded' });
			const target = event.currentTarget.contentWindow;
			if (loads.current > 1 || !target) return;

			const channel = new MessageChannel();
			channel.port1.onmessage = ({ data }) => {
				if (!isHostMessage(data)) return;
				if (data.type === 'pong') waitingSince.current = null;
				else dispatch({ type: 'message', message: data });
			};
			port.current = channel.port1;
			const run: RunMessage = {
				type: 'run',
				app,
				theme: readSandboxTheme(dark),
			};
			// The sandboxed frame has an opaque origin ("null"), so no origin can be named.
			// The code and theme are not secret, and everything after this goes over the
			// port, which only this frame holds.
			target.postMessage(run, '*', [channel.port2]);
		},
		[app, dark]
	);

	useEffect(() => () => port.current?.close(), []);

	// it has a few seconds to say it is ready, from when its code was sent
	const { phase } = state;
	useEffect(() => {
		if (phase !== 'starting') return;
		const timer = setTimeout(
			() => dispatch({ type: 'timeout' }),
			MINI_APP_START_MS
		);
		return () => clearTimeout(timer);
	}, [phase]);

	// Then it must answer every ping. A hidden tab is skipped: browsers slow its
	// timers down, and the student cannot see the mini-app anyway.
	useEffect(() => {
		if (phase !== 'running') return;
		const timer = setInterval(() => {
			if (document.hidden) return;
			const since = waitingSince.current;
			if (since !== null && Date.now() - since > MINI_APP_PONG_MS) {
				dispatch({ type: 'frozen' });
			} else if (since === null) {
				waitingSince.current = Date.now();
				post(port.current, { type: 'ping' });
			}
		}, MINI_APP_PING_MS);
		return () => clearInterval(timer);
	}, [phase]);

	// a new theme or colour theme goes in once the page has repainted with it
	useEffect(() => {
		if (phase !== 'running') return;
		const frame = requestAnimationFrame(() =>
			post(port.current, { type: 'theme', theme: readSandboxTheme(dark) })
		);
		return () => cancelAnimationFrame(frame);
	}, [phase, dark, palette]);

	return { state, onLoad };
}

const post = (port: MessagePort | null, message: ParentMessage) =>
	port?.postMessage(message);
