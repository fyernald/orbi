import { courseKey } from '@/features/courses/query-keys';

export const modelsKey = ['models'] as const;
export const courseChatsKey = (courseId: string) =>
	[...courseKey(courseId), 'chats'] as const;
export const chatKey = (chatId: string) => ['chats', chatId] as const;
// outside the chat's key, so reloading a chat does not ask the model again
export const followUpsKey = (chatId: string, messageId: string) =>
	['follow-ups', chatId, messageId] as const;
