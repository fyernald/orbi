// Times each thinking part of a reply. The AI SDK makes one reasoning part per
// reasoning-start, so the n-th time belongs to the n-th thinking part.
export function createThinkingClock(now: () => Date, earlier: number[] = []) {
	const times = [...earlier];
	const started = new Map<string, { index: number; at: number }>();

	return {
		track(part: { type: string; id?: string }) {
			if (!part.id) return;
			if (part.type === 'reasoning-start') {
				started.set(part.id, {
					index: times.push(0) - 1,
					at: now().getTime(),
				});
			} else if (part.type === 'reasoning-end') {
				const start = started.get(part.id);
				if (start) times[start.index] = now().getTime() - start.at;
			}
		},
		// undefined until the reply has thought, so plain replies keep their metadata
		times: () => (times.length > 0 ? [...times] : undefined),
	};
}

// the times a reply already has, one per thinking part; older replies have none saved
export function thinkingTimesOf(message: {
	parts: { type: string }[];
	metadata?: { thinkingMs?: number[] };
}): number[] {
	return message.parts
		.filter(({ type }) => type === 'reasoning')
		.map((_, index) => message.metadata?.thinkingMs?.[index] ?? 0);
}
