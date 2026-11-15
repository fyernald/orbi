'use client';

import {
	profile,
	type MascotSettings,
	type Profile,
	type TipId,
} from '@orbi/shared';
import {
	useMutation,
	useQuery,
	useQueryClient,
	type QueryClient,
	type QueryKey,
} from '@tanstack/react-query';
import { api } from '@/lib/api';

export const mascotKey = ['profile', 'mascot'] as const;
export const dismissedTipsKey = ['profile', 'dismissed-tips'] as const;

// One value of the profile. The server sends it with the page; the cat's menu,
// its tips and Settings change it here, so every place follows at once.
function useProfileValue<T>(
	queryKey: QueryKey,
	pick: (saved: Profile) => T,
	saved: T
): T {
	const query = useQuery({
		queryKey,
		queryFn: async () => pick(await api.get('/profile', profile)),
		initialData: saved,
		staleTime: Infinity,
	});
	return query.data ?? saved;
}

// the change shows before the server answers; a failed save puts it back
async function changeAtOnce<T>(
	queryClient: QueryClient,
	queryKey: QueryKey,
	change: (current: T | undefined) => T
) {
	await queryClient.cancelQueries({ queryKey });
	const before = queryClient.getQueryData<T>(queryKey);
	queryClient.setQueryData<T>(queryKey, change(before));
	return { undo: () => queryClient.setQueryData(queryKey, before) };
}

// whether the cat shows
export const useMascotEnabled = (saved: boolean) =>
	useProfileValue(mascotKey, (value) => value.mascotEnabled, saved);

export function useSaveMascot() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: MascotSettings) =>
			api.patch('/profile', profile, input),
		onMutate: ({ mascotEnabled }) =>
			changeAtOnce(queryClient, mascotKey, () => mascotEnabled),
		onError: (_error, _input, context) => context?.undo(),
		onSuccess: (saved) =>
			queryClient.setQueryData(mascotKey, saved.mascotEnabled),
	});
}

// the tips the student closed, which never come back
export const useDismissedTips = (saved: string[]) =>
	useProfileValue(dismissedTipsKey, (value) => value.dismissedTips, saved);

export function useDismissTip() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (tipId: TipId) => api.post('/profile/tips', profile, { tipId }),
		onMutate: (tipId) =>
			changeAtOnce<string[]>(queryClient, dismissedTipsKey, (current = []) => [
				...current,
				tipId,
			]),
		onError: (_error, _tipId, context) => context?.undo(),
		onSuccess: (saved) =>
			queryClient.setQueryData(dismissedTipsKey, saved.dismissedTips),
	});
}
