import { CHAT_TITLE_MAX_LENGTH } from '@orbi/shared';

// a chat is named after the first line of its first message
export function chatTitle(message: string, fallback: string): string {
	const firstLine = message
		.split('\n')
		.map((line) => line.trim())
		.find((line) => line.length > 0);
	if (!firstLine) return fallback;
	if (firstLine.length <= CHAT_TITLE_MAX_LENGTH) return firstLine;
	return `${firstLine.slice(0, CHAT_TITLE_MAX_LENGTH - 1).trimEnd()}…`;
}
