import { errorText } from './error-text';

// Every error the mini-app throws or leaves unhandled, as one line of text
export function watchErrors(report: (message: string) => void) {
	window.addEventListener('error', (event) => {
		report(errorText(event.error ?? event.message));
	});
	window.addEventListener('unhandledrejection', (event) => {
		report(errorText(event.reason));
	});
}

// The body's height at the frame's full width. It is measured with the scrollbar
// off: a scrollbar makes the page narrower, so a canvas that fits the width gets
// shorter, and a frame sized from that would stay one scrollbar too short.
function fullWidthHeight() {
	const root = document.documentElement;
	const overflow = root.style.overflowY;
	root.style.overflowY = 'hidden';
	const { body } = document;
	const height = Math.max(
		body.scrollHeight,
		body.getBoundingClientRect().height
	);
	root.style.overflowY = overflow;
	return Math.ceil(height);
}

// the height the mini-app needs, each time it changes, so the chat sizes the frame
export function watchHeight(report: (height: number) => void) {
	let last = 0;
	const measure = () => {
		const height = fullWidthHeight();
		if (height !== last) {
			last = height;
			report(height);
		}
	};
	new ResizeObserver(measure).observe(document.body);
	measure();
}
