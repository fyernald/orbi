'use client';

import { aiUsage, type AiUsage } from '@orbi/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNow } from '@/hooks/use-now';
import { api } from '@/lib/api';
import { usageBlockReason, usageNotice } from './usage';

export const usageKey = ['usage'] as const;

// countdowns and the block move on about twice a minute
const TICK_MS = 30_000;

// The student's AI usage, worked out by the server. It is asked again after every
// reply and when a window resets, so the app opens again without a reload.
export function useAiUsage() {
	const queryClient = useQueryClient();
	const usage = useQuery({
		queryKey: usageKey,
		queryFn: () => api.get('/usage', aiUsage),
		staleTime: TICK_MS,
	});

	const nextReset = nextResetOf(usage.data);
	useEffect(() => {
		if (!nextReset) return;
		const wait = new Date(nextReset).getTime() - Date.now() + 1000;
		const timer = window.setTimeout(
			() => void queryClient.invalidateQueries({ queryKey: usageKey }),
			Math.max(wait, 1000)
		);
		return () => window.clearTimeout(timer);
	}, [nextReset, queryClient]);

	return usage;
}

const nextResetOf = (usage: AiUsage | undefined) =>
	[usage?.hour.resetsAt, usage?.week.resetsAt]
		.filter((value): value is string => Boolean(value))
		.sort()[0];

// asks for the usage again; call it after anything that used the AI
export function useRefreshUsage() {
	const queryClient = useQueryClient();
	return () => void queryClient.invalidateQueries({ queryKey: usageKey });
}

// why no AI request can be sent right now, or null
export function useUsageBlock(): string | null {
	const { data } = useAiUsage();
	const now = useNow(TICK_MS);
	return data ? usageBlockReason(data, now) : null;
}

// the "wrapping up" notice for the message box, or null
export function useUsageNotice() {
	const { data } = useAiUsage();
	const now = useNow(TICK_MS);
	return data ? usageNotice(data, now) : null;
}
