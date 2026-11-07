import { z } from 'zod';

const topicId = z.uuid();

// The open topic chat from the address (?topic=), or undefined for the whole-course
// chat. Anything that is not a topic id counts as no topic; a topic deleted since the
// link was made is checked by the course page once its topics load.
export function parseTopicParam(value: unknown): string | undefined {
	const parsed = topicId.safeParse(value);
	return parsed.success ? parsed.data : undefined;
}
