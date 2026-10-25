'use client';

import type {
	EmailInput,
	ResetPasswordInput,
	SignInInput,
	SignUpInput,
} from '@orbi/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
import { routes } from '@/lib/routes';
import { unwrap } from './errors';
import { sessionQueryKey, toSession } from './session-query';

// The session in the query cache is the single source of truth for "who is logged in".
// The server layouts fill it before the first render; the page guards react to it,
// so these hooks never navigate.
export function useSession() {
	return useQuery({
		queryKey: sessionQueryKey,
		queryFn: async () => toSession(unwrap(await authClient.getSession())),
	});
}

// The confirmation link logs the user in and opens the login page, which sends them on to the app.
// If the link is broken, the login page shows why (brokenConfirmLinkMessage).
const afterEmailConfirmed = routes.login;

// waits for the new session, so the guards see it before the form stops pending
function useRefreshSession() {
	const queryClient = useQueryClient();
	return () => queryClient.refetchQueries({ queryKey: sessionQueryKey });
}

export function useSignIn() {
	const refreshSession = useRefreshSession();
	return useMutation({
		mutationFn: async (input: SignInInput) =>
			unwrap(
				await authClient.signIn.email({
					...input,
					// used when the email is not confirmed yet and a new link is sent
					callbackURL: afterEmailConfirmed,
				})
			),
		onSuccess: refreshSession,
	});
}

// a new account gets a confirmation email and no session until it is confirmed
export function useSignUp() {
	return useMutation({
		mutationFn: async (input: SignUpInput) =>
			unwrap(
				await authClient.signUp.email({
					...input,
					callbackURL: afterEmailConfirmed,
				})
			),
	});
}

export function useResendConfirmation() {
	return useMutation({
		mutationFn: async ({ email }: EmailInput) =>
			unwrap(
				await authClient.sendVerificationEmail({
					email,
					callbackURL: afterEmailConfirmed,
				})
			),
	});
}

export function useRequestPasswordReset() {
	return useMutation({
		mutationFn: async ({ email }: EmailInput) =>
			unwrap(
				await authClient.requestPasswordReset({
					email,
					redirectTo: routes.resetPassword,
				})
			),
	});
}

export function useResetPassword(token: string) {
	return useMutation({
		mutationFn: async ({ newPassword }: ResetPasswordInput) =>
			unwrap(await authClient.resetPassword({ newPassword, token })),
	});
}

export function useSignOut() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => unwrap(await authClient.signOut()),
		onSuccess: () => {
			// drop the old user's data, so the next user on this browser never sees it
			queryClient.removeQueries({
				predicate: (query) => query.queryKey[0] !== sessionQueryKey[0],
			});
			queryClient.setQueryData(sessionQueryKey, null);
		},
	});
}
