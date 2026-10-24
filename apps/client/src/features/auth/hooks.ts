'use client';

import type { SignInInput, SignUpInput } from '@orbi/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
import { unwrap } from './errors';

// The session in the query cache is the single source of truth for "who is logged in".
// The page guards react to it, so these hooks never navigate.
const sessionKey = ['auth', 'session'] as const;

export function useSession() {
	return useQuery({
		queryKey: sessionKey,
		queryFn: async () => unwrap(await authClient.getSession()),
	});
}

// waits for the new session, so the guards see it before the form stops pending
function useRefreshSession() {
	const queryClient = useQueryClient();
	return () => queryClient.refetchQueries({ queryKey: sessionKey });
}

export function useSignIn() {
	const refreshSession = useRefreshSession();
	return useMutation({
		mutationFn: async (input: SignInInput) =>
			unwrap(await authClient.signIn.email(input)),
		onSuccess: refreshSession,
	});
}

// a new account is logged in right away
export function useSignUp() {
	const refreshSession = useRefreshSession();
	return useMutation({
		mutationFn: async (input: SignUpInput) =>
			unwrap(await authClient.signUp.email(input)),
		onSuccess: refreshSession,
	});
}

export function useSignOut() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => unwrap(await authClient.signOut()),
		onSuccess: () => {
			// drop the old user's data, so the next user on this browser never sees it
			queryClient.removeQueries({
				predicate: (query) => query.queryKey[0] !== sessionKey[0],
			});
			queryClient.setQueryData(sessionKey, null);
		},
	});
}
