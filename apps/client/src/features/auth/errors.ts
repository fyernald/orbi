type AuthErrorBody = { code?: string; message?: string; status: number };

type AuthResult<T> =
	{ data: T; error: null } | { data: null; error: AuthErrorBody };

export class AuthError extends Error {
	readonly code?: string;
	readonly status: number;

	constructor({ code, message, status }: AuthErrorBody) {
		super(message ?? 'Request failed');
		this.name = 'AuthError';
		this.code = code;
		this.status = status;
	}
}

// Better Auth answers with { data, error } instead of throwing, which TanStack Query needs
export function unwrap<T>(result: AuthResult<T>): T {
	if (result.error) throw new AuthError(result.error);
	return result.data;
}

const messages: Record<string, string> = {
	INVALID_EMAIL_OR_PASSWORD: 'Wrong email or password.',
	EMAIL_NOT_VERIFIED: 'Confirm your email first. We just sent you a new link.',
	INVALID_TOKEN: 'This link has expired or was already used.',
	// only on local runs; production answers the same for a taken email
	USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'This email already has an account.',
};

// shown on the login page when the server sends the user back from a broken confirmation link
export const brokenConfirmLinkMessage =
	'This link has expired or was already used. Log in and we will send you a new one.';

const fallback = 'Something went wrong. Please try again.';

export function authErrorMessage(error: unknown): string | undefined {
	if (!error) return undefined;
	if (!(error instanceof AuthError)) return fallback;
	if (error.status === 429) {
		return 'Too many attempts. Wait a minute and try again.';
	}
	if (error.code === 'VALIDATION_ERROR') return error.message;
	return (error.code && messages[error.code]) || fallback;
}
