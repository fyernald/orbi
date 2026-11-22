// How long the model may take to start answering, for each step of a reply.
//
// The AI SDK has its own firstChunkMs, but it only starts counting once the
// provider has sent its response headers. Gemini Flash can hold those back for
// a minute or more, so that timeout never ran and the student waited for the
// total timeout with nothing on screen. This clock starts when the model is
// asked, and again after every step, so a slow start ends the reply with a
// clear error the student can retry.

// the parts that show the model has started answering
const OUTPUT_PARTS = new Set([
	'text-delta',
	'reasoning-delta',
	'tool-input-start',
	'tool-call',
	'file',
]);

// the parts after which no model output can follow
const END_PARTS = new Set(['finish', 'abort', 'error']);

export interface FirstOutputTimeout {
	// ends when the student stops the reply, or when the model is too slow to start
	signal: AbortSignal;
	// passes the reply's parts through; the clock stops at the first output and
	// starts again when a step ends, since the next step asks the model again
	watch<Part extends { type: string }>(): TransformStream<Part, Part>;
	// the reply was ended because the model did not start answering in time
	timedOut(): boolean;
}

// starts counting at once, so call it right before asking the model
export function createFirstOutputTimeout(
	ms: number,
	studentSignal: AbortSignal
): FirstOutputTimeout {
	const controller = new AbortController();
	let timer: ReturnType<typeof setTimeout> | undefined;

	const stop = () => {
		clearTimeout(timer);
		timer = undefined;
	};
	const start = () => {
		stop();
		if (studentSignal.aborted) return;
		timer = setTimeout(
			() =>
				controller.abort(
					new DOMException(
						`The model did not start answering within ${ms} ms.`,
						'TimeoutError'
					)
				),
			ms
		);
	};

	studentSignal.addEventListener('abort', stop, { once: true });
	start();

	return {
		signal: AbortSignal.any([studentSignal, controller.signal]),
		timedOut: () => controller.signal.aborted,
		watch: () =>
			new TransformStream({
				transform(part, stream) {
					if (OUTPUT_PARTS.has(part.type) || END_PARTS.has(part.type)) stop();
					else if (part.type === 'finish-step') start();
					stream.enqueue(part);
				},
				flush: stop,
			}),
	};
}
