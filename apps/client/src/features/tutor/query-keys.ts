import { courseKey } from '@/features/courses/query-keys';

export const modelsKey = ['models'] as const;
export const courseChatsKey = (courseId: string) =>
	[...courseKey(courseId), 'chats'] as const;
export const chatKey = (chatId: string) => ['chats', chatId] as const;
