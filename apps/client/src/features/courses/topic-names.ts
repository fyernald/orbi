export const DUPLICATE_TOPIC_MESSAGE = 'This topic is already in the list.';

// Two topic names are the same when only their case differs ("Mitosis" and
// "mitosis"); accents still count. The topic name schema trims both ends first.
export const sameTopicName = (first: string, second: string) =>
	first.localeCompare(second, undefined, { sensitivity: 'accent' }) === 0;

// whether a course (or the new course form) already has a topic with this name
export const hasTopicNamed = (names: readonly string[], name: string) =>
	names.some((existing) => sameTopicName(existing, name));
