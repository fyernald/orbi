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

// the height the mini-app needs, each time it changes, so the chat sizes the frame
export function watchHeight(report: (height: number) => void) {
	let last = 0;
	const measure = () => {
		const { body } = document;
		const height = Math.ceil(
			Math.max(body.scrollHeight, body.getBoundingClientRect().height)
		);
		if (height !== last) {
			last = height;
			report(height);
		}
	};
	new ResizeObserver(measure).observe(document.body);
	measure();
}
