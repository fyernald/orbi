// a visual's title, as soon as it has streamed in, for its skeleton and error card
export function streamedTitle(input: unknown): string | undefined {
	const title = (input as { title?: unknown } | undefined)?.title;
	return typeof title === 'string' && title.trim() ? title : undefined;
}
