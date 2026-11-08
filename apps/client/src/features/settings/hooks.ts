'use client';

import {
	profile,
	type AiModels,
	type DefaultModelSettings,
	type ReminderSettings,
} from '@orbi/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { modelsKey } from '@/features/tutor/query-keys';
import { api } from '@/lib/api';

// the saved settings come from the server with the page (getServerProfile)
export function useSaveReminder() {
	return useMutation({
		mutationFn: (input: ReminderSettings) =>
			api.patch('/profile', profile, input),
	});
}

// New chats start on the saved model at once, without a reload. The server only
// saves a model it can call, so it becomes the default as it is.
export function useSaveDefaultModel() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: DefaultModelSettings) =>
			api.patch('/profile', profile, input),
		onSuccess: ({ defaultModelId }) => {
			queryClient.setQueryData<AiModels>(modelsKey, (current) =>
				current && defaultModelId ? { ...current, defaultModelId } : current
			);
		},
	});
}
