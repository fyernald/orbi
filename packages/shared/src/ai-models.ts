import { z } from 'zod';

export const AI_PROVIDERS = ['google', 'anthropic'] as const;

// a model the student can pick; the server's catalog decides which ones exist
export const aiModel = z.object({
	id: z.string(),
	label: z.string(),
	provider: z.enum(AI_PROVIDERS),
	goodAt: z.string(),
});

// only models whose provider has an API key on the server are listed
export const aiModels = z.object({
	models: z.array(aiModel),
	defaultModelId: z.string().nullable(),
});

export type AiProvider = (typeof AI_PROVIDERS)[number];
export type AiModel = z.infer<typeof aiModel>;
export type AiModels = z.infer<typeof aiModels>;
