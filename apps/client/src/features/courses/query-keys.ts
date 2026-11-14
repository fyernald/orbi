// the TanStack Query keys of courses and what belongs to them; notes live under their topic
export const coursesKey = ['courses'] as const;
export const courseKey = (courseId: string) =>
	[...coursesKey, courseId] as const;
export const topicsKey = (courseId: string) =>
	[...courseKey(courseId), 'topics'] as const;
export const notesKey = (courseId: string, topicId: string) =>
	[...topicsKey(courseId), topicId, 'notes'] as const;
// every topic of every course, for the message box on Home
export const allTopicsKey = [...coursesKey, 'all-topics'] as const;
// the mastery score of every topic, apart from the topics, since answers change it
export const masteryKey = ['mastery'] as const;
export const courseMasteryKey = (courseId: string) =>
	[...masteryKey, courseId] as const;
