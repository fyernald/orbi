// Splits a stream of text into its lines as they come. The last piece without a
// line break waits for the rest; blank lines (a server's keep-alive) are left out.
export function createLineSplitter() {
	let rest = '';
	return {
		push(text: string): string[] {
			const lines = (rest + text).split('\n');
			rest = lines.pop() ?? '';
			return lines.filter((line) => line.trim() !== '');
		},
		end(): string[] {
			const last = rest.trim();
			rest = '';
			return last ? [last] : [];
		},
	};
}

// reads a response body of one JSON value per line, handing each one on
export async function readJsonLines(
	body: ReadableStream<Uint8Array>,
	onLine: (value: unknown) => void
): Promise<void> {
	const splitter = createLineSplitter();
	const decoder = new TextDecoder();
	const reader = body.getReader();
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		splitter
			.push(decoder.decode(value, { stream: true }))
			.forEach((line) => onLine(JSON.parse(line)));
	}
	splitter.end().forEach((line) => onLine(JSON.parse(line)));
}
