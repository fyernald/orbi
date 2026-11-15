'use client';

import { profile, type MascotSettings } from '@orbi/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const mascotKey = ['profile', 'mascot'] as const;

// Whether the cat shows. The server sends it with the page; Settings and the
// cat's own menu change it here, so the top bar follows at once.
export function useMascotEnabled(saved: boolean): boolean {
	return useQuery({
		queryKey: mascotKey,
		queryFn: async () => (await api.get('/profile', profile)).mascotEnabled,
		initialData: saved,
		staleTime: Infinity,
	}).data;
}

// the cat comes and goes before the server answers; a failed save puts it back
export function useSaveMascot() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: MascotSettings) =>
			api.patch('/profile', profile, input),
		onMutate: async ({ mascotEnabled }) => {
			await queryClient.cancelQueries({ queryKey: mascotKey });
			const before = queryClient.getQueryData<boolean>(mascotKey);
			queryClient.setQueryData(mascotKey, mascotEnabled);
			return { before };
		},
		onError: (_error, _input, context) =>
			queryClient.setQueryData(mascotKey, context?.before),
		onSuccess: (saved) =>
			queryClient.setQueryData(mascotKey, saved.mascotEnabled),
	});
}
