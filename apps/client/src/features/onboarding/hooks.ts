'use client';

import { profile, type UpdateProfileInput } from '@orbi/shared';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

// the saved profile comes from the server with the page (getServerProfile),
// so onboarding only needs to send answers

export function useSaveAnswers() {
	return useMutation({
		mutationFn: (input: UpdateProfileInput) =>
			api.patch('/profile', profile, input),
	});
}

export function useFinishOnboarding() {
	return useMutation({
		mutationFn: () => api.post('/profile/onboarding', profile),
	});
}
