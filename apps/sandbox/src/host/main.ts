import {
	isParentMessage,
	isRunMessage,
	type HostMessage,
	type RunMessage,
} from '@orbi/shared/mini-app-protocol';
import { applyTheme } from './apply-theme';
import { errorText } from './error-text';
import { loadLibraries, startP5GlobalMode } from './libraries';
import { guardLoops, installLoopGuard } from './loop-guard';
import { mountApp, runScript } from './mount-app';
import { watchErrors, watchHeight } from './watch-page';

// The sandbox page's script. It waits for the one mini-app the chat page sends,
// runs it, and from then on talks only over the port that came with it.

async function run({ app, theme }: RunMessage, port: MessagePort) {
	const send = (message: HostMessage) => port.postMessage(message);
	port.onmessage = ({ data }) => {
		if (!isParentMessage(data)) return;
		if (data.type === 'ping') send({ type: 'pong' });
		else applyTheme(data.theme);
	};

	const loopGuard = installLoopGuard();
	// an error while the code first runs means it failed; later ones are reported
	let firstError: string | undefined;
	let started = false;
	watchErrors((message) => {
		if (started) send({ type: 'error', message });
		else firstError ??= message;
	});

	try {
		await loadLibraries(app.libraries);
	} catch (error) {
		send({ type: 'error', message: errorText(error) });
		return;
	}
	applyTheme(theme);
	mountApp(app);
	loopGuard.breathe();
	runScript(guardLoops(app.js));
	startP5GlobalMode();
	started = true;

	send(firstError ? { type: 'error', message: firstError } : { type: 'ready' });
	watchHeight((height) => send({ type: 'height', height }));
}

// Only the page that embeds the sandbox may start it: the server lets only Orbi
// embed it (frame-ancestors), and a page that merely opened it is not its parent.
function onMessage(event: MessageEvent) {
	if (window.parent === window || event.source !== window.parent) return;
	const [port] = event.ports;
	if (!port || !isRunMessage(event.data)) return;
	window.removeEventListener('message', onMessage);
	void run(event.data, port);
}

window.addEventListener('message', onMessage);
