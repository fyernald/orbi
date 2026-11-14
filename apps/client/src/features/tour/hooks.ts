'use client';

import { profile } from '@orbi/shared';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

// finished or skipped: saved with the account, so the tour does not start by
// itself again, on this device or another
export function useFinishTour() {
	return useMutation({
		mutationFn: () => api.post('/profile/tour', profile),
	});
}
