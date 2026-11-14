'use client';

import { todayPlan } from '@orbi/shared';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const todayKey = ['today'] as const;

// always loads again when Home opens, since answers, approvals, and new questions
// anywhere in the app change it
export function useToday() {
	return useQuery({
		queryKey: todayKey,
		queryFn: () => api.get('/today', todayPlan),
		staleTime: 0,
	});
}
