'use client';

import { profile, type ReminderSettings } from '@orbi/shared';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

// the saved settings come from the server with the page (getServerProfile)
export function useSaveReminder() {
	return useMutation({
		mutationFn: (input: ReminderSettings) =>
			api.patch('/profile', profile, input),
	});
}
